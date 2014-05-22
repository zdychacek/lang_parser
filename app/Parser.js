import {
  TokenType,
  Punctuator,
  Keyword,
  Precedence
} from './Lexer';
import ParserState from './ParserState';
import Program from './Program';
import BlockStatement from './statements/BlockStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import LabeledStatementParser from './statements/parsers/LabeledStatementParser';
import IdentifierExpressionParser from './expressions/parsers/IdentifierExpressionParser';
import ValidationVisitor from './ValidationVisitor';
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

    // validator
    this._astValidator = new ValidationVisitor(globals);
  }

  /**
   * Reset parser's state.
   */
  reset () {
    // parser state
    this._state = new ParserState();
    this._astValidator.reset();
  }

  /**
   * Return parsers current state.
   */
  get state () {
    return this._state;
  }

  /**
   * Gets warnings from AST validator.
   */
  get warnings () {
    return this._astValidator._warnings;
  }

  /**
   * Gets errors from AST validator.
   */
  get errors () {
    return this._astValidator._errors;
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
    var token = this.peek();
    var prefixParser = this.getPrefixExpressionParser(token);

    if (this.matchType(TokenType.EOF, token)) {
      this.throw('Unexpected end of file');
    }

    if (!prefixParser) {
      this.throw(`Unexpected token '${token.value}'`);
    }

    // get prexix parser
    var left = prefixParser.parse(this);

    while (precedence < this.getPrecedence()) {
      token = this.peek();

      if (token.value == Keyword.In && !this.state.getAttribute('allowIn')) {
        break;
      }

      // get infix parser
      let infixParser = this.getInfixExpressionParser(token);

      left = infixParser.parse(this, left);
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

      // optional semicolon
      this.consumeSemicolon();

      return new ExpressionStatement(expr);
    }
  }

  /**
   * Parses block of statements.
   */
  parseBlock () {
    var token = this.peek();

    // block starts with opening curly bracket
    this.consume(Punctuator.OpenCurly);

    let body = this.parseStatements();

    // block ends with closing curly bracket
    this.consume(Punctuator.CloseCurly);

    return new BlockStatement(body);
  }

  /**
   * Parse and return expression statement or block statement.
   */
  parseBlockOrExpression () {
    if (this.match(Punctuator.OpenCurly)) {
      return this.parseBlock();
    }
    else {
      return this.parseStatement();
    }
  }

  /**
   * Parses function parameters.
   */
  parseArguments () {
    var params = [];
    // array of default parameter values
    var defaults = [];
    var rest = null;
    // if at least one parameter has default value
    var hasDefaultValue = false;

    // parse parameters
    do {
      let param = IdentifierExpressionParser.parse(this);
      let defaultValue = null;

      // try to parse parameter default value
      if (this.matchAndConsume(Punctuator.Assign)) {
        defaultValue = this.parseExpression(Precedence.Sequence);
        hasDefaultValue = true;
      }

      // push parameter default value
      defaults.push(defaultValue);
      params.push(param);
    }
    while (this.matchAndConsume(Punctuator.Comma));

    if (!hasDefaultValue) {
      defaults = null;
    }

    return { params, defaults, rest };
  }

  /**
   * Starts parsing program.
   */
  parseProgram (validate) {
    var start = new Date();

    this.reset();

    var body = this.parseStatements();
    var token = this.peek();

    if (token.type != TokenType.EOF) {
      this.throw(`Unexpected token '${token.value}'`);
    }

    var ast = new Program(body);

    // validate AST
    if (validate) {
      this._astValidator.visitProgram(ast);
    }

    var time = (new Date() - start) / 1000;

    console.log(`parsing: ${time} s`);

    return ast;
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
   * Consumes semicolon, if there is some.
   */
  consumeSemicolon () {
    if (this.match(Punctuator.Semicolon)) {
      return this.consume(Punctuator.Semicolon);
    }

    if (this.matchType(TokenType.EOF) || this.match(Punctuator.CloseCurly)) {
      return;
    }

    if (!this.peekLineTerminator()) {
      let token = this.peek().value;

      this.throw(`Unexpected token '${token}'`);
    }
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
    message = this._formatMessage(message);

    throw new _Error(message);
  }

  _formatMessage (message) {
    var { line, column } = this._lexer.lineAndColumn;

    return `ln: ${line}, col: ${column} - ${message}.`;
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
