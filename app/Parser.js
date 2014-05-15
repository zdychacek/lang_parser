import {
  TokenType,
  Punctuator,
  Keyword
} from './Lexer';
import {
  Scope,
  ScopeType
} from './Scope';
import ParserState from './ParserState';
import Program from './Program';
import BlockStatement from './statements/BlockStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import LabeledStatementParser from './statements/parsers/LabeledStatementParser';

/**
 * Represents parser.
 */
export default class Parser {
  constructor (lexer, globals = null) {
    // lexer reference for tokens supply
    this._lexer = lexer;

    // prefix expressions parsers
    this._prefixExpressions = new Map();

    // infix expressions parsers
    this._infixExpressions = new Map();

    // statements parsers
    this._statements = new Map();

    // parser will ignore these globals
    this._globals = {};

    // set globals
    this.globals = globals;
  }

  /**
   * Reset parser's state.
   */
  reset () {
    // parser state
    this._state = new ParserState();

    // scope chain for identifier lookup
    this._scopeChain = [];  // of scopes

    // create global scope
    this.pushScope(ScopeType.Function, this._globals);
  }

  /**
   * These globals will be defined in global scope.
   */
  set globals (globals) {
    globals.forEach((global) => this._globals[global] = Keyword.Var);
  }

  /**
   * Pushes new scope on stack, optionaly with some injected variables.
   */
  pushScope (type = ScopeType.Function, injectVariables = null) {
    var newScope = new Scope({
      parent: this._scopeChain.length? this.scope : null,
      type
    }, this);

    // inject some variables
    if (injectVariables) {
      for (let name in injectVariables) {
        if (injectVariables.hasOwnProperty(name)) {
          newScope.define(name, injectVariables[name]);
        }
      }
    }

    this._scopeChain.push(newScope);

    return newScope;
  }

  /**
   * Pops and returns current scope from stack.
   */
  popScope () {
    return this._scopeChain.pop();
  }

  /**
   * Returns current scope.
   */
  get scope () {
    var len = this._scopeChain.length;

    return this._scopeChain[len - 1];
  }

  /**
   * Returns global scope.
   */
  get globalScope () {
    return this._scopeChain[0];
  }

  /**
   * Return parsers current state.
   */
  get state () {
    return this._state;
  }

  /**
   * Registers prefix operator expression parser.
   */
  registerPrefix (token, expression) {
    this._prefixExpressions.set(token, expression);
  }

  /**
   * Registers infix (postfix) operator expression parser.
   */
  registerInfix (token, expression) {
    this._infixExpressions.set(token, expression);
  }

  /**
   * Registers statement parser.
   */
  registerStatement (token, statement) {
    this._statements.set(token, statement);
  }

  /**
   * Returns prefix expression parser.
   */
  getPrefixExpressionParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._prefixExpressions.get(key);
  }

  /**
   * Returns infix expression parser.
   */
  getInfixExpressionParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._infixExpressions.get(key);
  }

  /**
   * Parses expressions.
   */
  parseExpression (precedence = 0) {
    var token = this.consume();
    var prefixParser = this.getPrefixExpressionParser(token);

    if (this.matchType(TokenType.EOF, token)) {
      this.throw('Unexpected end of file');
    }

    if (!prefixParser) {
      this.throw(`Unexpected token '${token.value}'`);
    }

    var left = prefixParser.parse(this, token);

    while (precedence < this.getPrecedence()) {
      token = this.peek();

      if (token.value == Keyword.In && !this.state.getAttribute('allowIn')) {
        break;
      }

      //token = this.consume();

      let infixParser = this.getInfixExpressionParser(token);

      left = infixParser.parse(this, left/*, token*/);
    }

    return left;
  }

  /**
   * Parses and returns array of statements (expressions).
   */
  parseStatements () {
    var statements = [];

    while (true) {
      if (this.match(Punctuator.CloseCurly)
        || this.match(Keyword.Case)
        || this.match(Keyword.Default)
        || this.matchType(TokenType.EOF)
      ) {
        break;
      }

      let st = this.parseStatement();

      if (st) {
        statements.push(st);
      }
    }

    return statements;
  }

  /**
   * Parses one statement or expression statement.
   */
  parseStatement (params = null) {
    var token = this.peek();
    var statementExpression = null;

    // try to parse labeled statement
    if (this.matchType(TokenType.Identifier)) {
      let token1 = this.peek(1);

      if (token1.value == Punctuator.Colon) {
        statementExpression = new LabeledStatementParser();
      }
    }
    else {
      statementExpression = this._statements.get(token.value);
    }

    if (statementExpression) {
      return statementExpression.parse(this, params);
    }
    else {
      let expr = this.parseExpression();

      // required semicolon
      this.consume(Punctuator.Semicolon);

      return new ExpressionStatement(expr);
    }
  }

  /**
   * Parses block of statements. Optionally creates new function/block scope and inject some variables into it.
   */
  parseBlock (scopeType, injectables) {
    var token = this.peek();

    // block starts with opening curly bracket
    this.consume(Punctuator.OpenCurly);

    if (scopeType) {
      this.pushScope(scopeType, injectables);
    }

    let body = this.parseStatements();

    if (scopeType) {
      this.popScope();
    }

    // block ends with closing curly bracket
    this.consume(Punctuator.CloseCurly);

    return new BlockStatement(body);
  }

  /**
   * Parse and return expression statement or block statement.
   * @injectables - variables which should be injected into scope being created
   * @forceScopeCreation - force new scope creation even if we are not parsing block statement (useful for FOR statement)
   */
  parseBlockOrExpression (injectables, forceScopeCreation = false) {
    var ret = null;

    // if we are parsing block, than we must create new block scope
    if (this.match(Punctuator.OpenCurly)) {
      ret = this.parseBlock(ScopeType.Block, injectables);
    }
    else {
      if (forceScopeCreation) {
        this.pushScope(ScopeType.Block, injectables);
      }

      ret = this.parseStatement();

      if (forceScopeCreation) {
        this.popScope();
      }
    }

    return ret;
  }

  /**
   * Starts parsing program.
   */
  parseProgram () {
    var start = new Date();

    this.reset();

    var body = this.parseStatements();
    var token = this.peek();

    if (token.type != TokenType.EOF) {
      this.throw(`Unexpected token '${token.value}'`);
    }

    var time = (new Date() - start) / 1000;

    console.log(`parsing: ${time} s`);

    return new Program(body);
  }

  /**
   * Transforms tokens.
   */
  _transformToken (token) {
    switch (token.type) {
      case TokenType.Boolean:
      case TokenType.String:
      case TokenType.Number:
      case TokenType.Null:
        token.type = TokenType.Literal;
    }

    return token;
  }

  /**
   * Gets next token from lexer and optionally checks expected token's value.
   */
  consume (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.value != expected) {
        this.throw(`Unexpected token '${token.value}'`);
      }
    }

    var next = this._lexer.next();

    return this._transformToken(next);
  }

  /**
   * Gets next token from lexer and optionally checks expected token's type.
   */
  consumeType (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.type != expected) {
        this.throw(`Unexpected token '${token.value}'`);
      }
    }

    var next = this._lexer.next();

    return this._transformToken(next);
  }

  /**
   * Checks if current (or specified) token has specific value. If so, than consumes it and returns true, otherwise false.
   */
  matchAndConsume (expected, token = this.peek()) {
    if (token && token.value == expected) {
      this.consume();

      return true;
    }

    return false;
  }

  /**
   * Checks if current (or specified) token has specific type. If so, than consumes it and returns true, otherwise false.
   */
  matchAndConsumeType (expected, token = this.peek()) {
    if (token && token.type == expected) {
      this.consume();

      return true;
    }

    return false;
  }

  /**
   * Checks if current token has specific value.
   */
  match (expected, token = this.peek()) {
    return token && token.value == expected;
  }

  /**
   * Checks if current token has specific type.
   */
  matchType (expected, token = this.peek()) {
    return token && token.type == expected;
  }

  peek (distance = 0) {
    var token = this._lexer.peek(distance);

    return this._transformToken(token);
  }

  /**
   * Returns true if there is line terminator before next token, otherwise return false.
   */
  peekLineTerminator () {
    return this._lexer.peekLineTerminator();
  }

  /**
   * Throws error with line and column information.
   */
  throw (message, _Error = SyntaxError) {
    var { line, column } = this._lexer.lineAndColumn;

    throw new _Error(`ln: ${line}, col: ${column} - ${message}.`);
  }

  /**
   * Gets precedence of current infix expression token.
   */
  getPrecedence () {
    var exprParser = this.getInfixExpressionParser(this.peek());

    if (exprParser) {
      return exprParser.precedence;
    }
    else {
      return 0;
    }
  }
}
