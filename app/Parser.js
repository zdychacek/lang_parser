import { TokenType, Punctuator } from './Lexer';
import Program from './statements/Program';
import BlockStatement from './statements/BlockStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import LabeledStatementParser from './statements/parsers/LabeledStatementParser';

class Scope {
  constructor (parent = null) {
    this._parent = parent;

    // map of variables defined in this scope
    this._vars = {};

    // array of labels (continue, break) defined in this scope
    this._labels = [];
  }

  declare (varName) {

  }

  define (varName, value) {

  }

  addLabel (name) {
    this._labels.push(name);
  }

  hasLabel (name) {
    return this._labels.indexOf(name) > -1;
  }
}

export default class Parser {
  constructor (lexer) {
    this._lexer = lexer;
    this._prefixExpressions = new Map();
    this._infixExpressions = new Map();
    this._statements = new Map();

    this.reset();
  }

  reset () {
    // parser state
    this._state = {
      // if we are currently parsing function body
      inFunction: false,
      // if we are currently parsing loop body
      inLoop: false
    };

    // scope chain for identifier lookup
    this._scopeChain = [];  // of scopes

    // create global scope
    this.pushScope();
  }

  pushScope () {
    var newScope = new Scope(this._scopeChain.length? this.scope : null);

    this._scopeChain.push(newScope);
  }

  popScope () {
    return this._scopeChain.pop();
  }

  // returns current scope
  get scope () {
    var len = this._scopeChain.length;

    return this._scopeChain[len - 1];
  }

  get state () {
    return this._state;
  }

  registerPrefix (token, expression) {
    this._prefixExpressions.set(token, expression);
  }

  registerInfix (token, expression) {
    this._infixExpressions.set(token, expression);
  }

  registerStatement (token, statementExpression) {
    this._statements.set(token, statementExpression);
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
      if (this.match(Punctuator.RightCurly) || this.matchType(TokenType.EOF)) {
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

  parseProgram () {
    this.reset();

    var body = this.parseStatements();
    var token = this.peek();

    if (token.type != TokenType.EOF) {
      token.error(`Unexpected token ${token.value}.`, false);
    }

    return new Program(body);
  }

  consume (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.value != expected) {
        token.error(`Unexpected token ${token.value}.`, false);
      }
    }

    return this._lexer.next();
  }

  consumeType (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.type != expected) {
        token.error(`Unexpected token type ${token.type}.`, false);
      }
    }

    return this._lexer.next();
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
    return this._lexer.peek(distance);
  }

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
