import { TokenType, Punctuator } from './Lexer';

export default class Parser {
  constructor (lexer) {
    this._lexer = lexer;
    this._prefixExpressions = new Map();
    this._infixExpressions = new Map();
    this._statements = new Map();
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

  getPrefixExpressionParserParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._prefixExpressions.get(key);
  }

  getInfixExpressionParserParser (token) {
    var key = token.type;

    if (key == TokenType.Keyword || key == TokenType.Punctuator) {
      key = token.value;
    }

    return this._infixExpressions.get(key);
  }

  parseExpression (precedence = 0) {
    var token = this.consume();
    var prefixParser = this.getPrefixExpressionParserParser(token);

    if (this.matchType(TokenType.EOF, token)) {
      token.error('Unexpected end of file.', false);
    }

    if (!prefixParser) {
      token.error('Could not parse.');
    }

    var left = prefixParser.parse(this, token);

    while (precedence < this.getPrecedence()) {
      token = this.consume();

      let infixParser = this.getInfixExpressionParserParser(token);

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
    var statementExpression = this._statements.get(token.value);

    if (statementExpression) {
        let statementToken = this.consume();

        return statementExpression.parse(this, statementToken);
    }
    else {
      let expr = this.parseExpression();
      this.consume(Punctuator.Semicolon);

      return {
        type: 'ExpressionStatement',
        expression: expr
      };
    }
  }

  parseBlock () {
    var token = this.peek();
    var statementExpression = this._statements.get(token.value);

    this.consume(Punctuator.LeftCurly);

    return {
      type: 'BlockStatement',
      body: statementExpression.parse(this)
    };
  }

  parseProgram () {
    return {
      type: 'Program',
      body: this.parseStatements()
    };
  }

  consume (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.value != expected) {
        token.error(`Unexpected token ${token.value}, got ${expected}.`, false);
      }
    }

    return this._lexer.next();
  }

  consumeType (expected) {
    if (expected) {
      let token = this.peek();

      if (!token || token.type != expected) {
        token.error(`Unexpected token type ${token.type}, got ${expected}.`, false);
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

  peek () {
    return this._lexer.peek();
  }

  getPrecedence () {
    var exprParser = this.getInfixExpressionParserParser(this.peek());

    if (exprParser) {
      return exprParser.precedence;
    }
    else {
      return 0;
    }
  }
}
