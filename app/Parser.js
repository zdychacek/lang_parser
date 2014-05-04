import { TokenType } from './Lexer';

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

  parseExpression (precedence = 0) {
    var token = this.consume();
    var key = token.type;

    if (key == TokenType.KEYWORD) {
      key = token.value;
    }

    var prefix = this._prefixExpressions.get(key);

    if (token.type == TokenType.EOF) {
      token.error('Unexpected end of file.', false);
    }

    if (prefix == null) {
      token.error('Could not parse.');
    }

    var left = prefix.parse(this, token);

    while (precedence < this.getPrecedence()) {
      token = this.consume();

      var infix = this._infixExpressions.get(token.type);

      left = infix.parse(this, left, token);
    }

    return left;
  }

  parseStatements () {
    var statements = [];

    while (true) {
      if (this.match(TokenType.RIGHT_CURLY) || this.match(TokenType.EOF)) {
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
      this.consume(TokenType.SEMICOLON);

      return {
        type: 'ExpressionStatement',
        expression: expr
      };
    }
  }

  parseBlock () {
    var token = this.peek();
    var statementExpression = this._statements.get(token.value);

    this.consume(TokenType.LEFT_CURLY);

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

  matchAndConsume (expected) {
    var token = this.peek();

    if (token.type == TokenType.KEYWORD && token.value == expected || token.type == expected) {
      this.consume();

      return true;
    }

    return false;
  }

  match (expected) {
    var token = this.peek();

    return token.type == TokenType.KEYWORD && token.value == expected || token.type == expected;
  }

  consume (expected) {
    if (expected) {
      var token = this.peek();

      if (token.type != expected && token.value != expected) {
        token.error(`Expected token "${expected}".`);
      }
    }

    return this._lexer.next();
  }

  peek () {
    return this._lexer.peek();
  }

  getPrecedence () {
    var next = this.peek();
    var parser = this._infixExpressions.get(next.type);

    if (parser) {
      return parser.getPrecedence();
    }
    else {
      return 0;
    }
  }
}
