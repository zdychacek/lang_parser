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
import Program from './statements/Program';
import BlockStatement from './statements/BlockStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import LabeledStatementParser from './statements/parsers/LabeledStatementParser';

export default class Parser {
  constructor (lexer, globals = null) {
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

  set globals (globals) {
    globals.forEach((global) => this._globals[global] = Keyword.Var);
  }

  /**
   * Push new scope on stack, optionaly with some injected variables.
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
   * Pop and return current scope from stack.
   */
  popScope () {
    return this._scopeChain.pop();
  }

  /**
   * Return current scope.
   */
  get scope () {
    var len = this._scopeChain.length;

    return this._scopeChain[len - 1];
  }

  /**
   * Return global scope.
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

  registerPrefix (token, expression) {
    this._prefixExpressions.set(token, expression);
  }

  registerInfix (token, expression) {
    this._infixExpressions.set(token, expression);
  }

  registerStatement (token, statement) {
    this._statements.set(token, statement);
  }

  getPrefixExpressionParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._prefixExpressions.get(key);
  }

  getInfixExpressionParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._infixExpressions.get(key);
  }

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

      token = this.consume();

      let infixParser = this.getInfixExpressionParser(token);

      left = infixParser.parse(this, left, token);
    }

    return left;
  }

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

  parseBlock (scopeType, injectables) {
    var token = this.peek();

    this.consume(Punctuator.OpenCurly);

    if (scopeType) {
      this.pushScope(scopeType, injectables);
    }

    let body = this.parseStatements();

    if (scopeType) {
      this.popScope();
    }

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

  parseProgram () {
    var start = new Date();

    this.reset();

    var body = this.parseStatements();
    var token = this.peek();

    if (token.type != TokenType.EOF) {
      this.throw(`Unexpected token ${token.value}`);
    }

    console.log('Time - parseProgram():', (new Date() - start) / 1000);

    return new Program(body);
  }

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

  consume (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.value != expected) {
        this.throw(`Unexpected token ${token.value}`);
      }
    }

    var next = this._lexer.next();

    return this._transformToken(next);
  }

  consumeType (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.type != expected) {
        this.throw(`Unexpected token ${token.value}`);
      }
    }

    var next = this._lexer.next();

    return this._transformToken(next);
  }

  matchAndConsume (expected, token = this.peek()) {
    if (token && token.value == expected) {
      this.consume();

      return true;
    }

    return false;
  }

  matchAndConsumeType (expected, token = this.peek()) {
    if (token && token.type == expected) {
      this.consume();

      return true;
    }

    return false;
  }

  match (expected, token = this.peek()) {
    return token && token.value == expected;
  }

  matchType (expected, token = this.peek()) {
    return token && token.type == expected;
  }

  peek (distance = 0) {
    var token = this._lexer.peek(distance);

    return this._transformToken(token);
  }

  /**
   * Return true if there is line terminator before next token, otherwise return false.
   */
  peekLineTerminator () {
    return this._lexer.peekLineTerminator();
  }

  throw (message, _Error = SyntaxError) {
    var { line, column } = this._lexer.lineAndColumn;

    throw new _Error(`ln: ${line}, col: ${column} - ${message}.`);
  }

  /**
   * Get precedence of current infix expression;
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
