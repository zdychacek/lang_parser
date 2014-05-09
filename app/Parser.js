import { TokenType, Punctuator, Keyword } from './Lexer';
import Scope from './Scope';
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

    this._globals = globals;

    // if we are parsing block
    this._blockOpened = false;
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
    this.pushScope(false, this._globals);
  }

  /**
   * Push new scope on stack, optionaly with some injected variables.
   */
  pushScope (block = false, injectVariables = null) {
    var newScope = new Scope({
      parent: this._scopeChain.length? this.scope : null,
      block
    });

    // inject some variables
    if (Array.isArray(injectVariables)) {
      injectVariables.forEach(function (varName) {
        newScope.define(varName);
      });
    }

    this._scopeChain.push(newScope);
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
      token.error('Unexpected end of file.', false);
    }

    if (!prefixParser) {
      token.error('Could not parse.');
    }

    var left = prefixParser.parse(this, token);

    while (precedence < this.getPrecedence()) {
      token = this.consume();

      let infixParser = this.getInfixExpressionParser(token);

      left = infixParser.parse(this, left, token);
    }

    return left;
  }

  parseStatements () {
    var statements = [];

    while (true) {
      if (this.match(Punctuator.RightCurly)
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

  parseStatement () {
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
      let statementToken = this.consume();

      return statementExpression.parse(this, statementToken);
    }
    else {
      let expr = this.parseExpression();

      // required semicolon
      this.consume(Punctuator.Semicolon);

      return new ExpressionStatement(expr);
    }
  }

  parseBlock () {
    var token = this.peek();

    this.consume(Punctuator.LeftCurly);

    let body = this.parseStatements();

    this.consume(Punctuator.RightCurly);

    return new BlockStatement(body);
  }

  /**
   * Parse and return expression statement or block statement.
   * @handleScope - if set and parsing block, than create new block scope
   */
  parseBlockOrExpression (handleScope = true) {
    var popScope = false;
    var ret = null;

    // if we are parsing block, than we must create new block scope
    if (handleScope && this.match(Punctuator.LeftCurly)) {
      this.pushScope(true);
      popScope = true;
    }

    if (this.match(Punctuator.LeftCurly)) {
      ret = this.parseBlock();
    }
    else {
      ret = this.parseStatement();
    }

    if (popScope) {
      this.popScope();
    }

    return ret;
  }

  parseProgram () {
    this.reset();

    var body = this.parseStatements();
    var token = this.peek();

    if (token.type != TokenType.EOF) {
      token.error(`Unexpected token ${token.value}.`, false);
    }

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
        token.error(`Unexpected token ${token.value}.`, false);
      }
    }

    var next = this._lexer.next();

    return this._transformToken(next);
  }

  consumeType (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.type != expected) {
        token.error(`Unexpected token type ${token.type}.`, false);
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
