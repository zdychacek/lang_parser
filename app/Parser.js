import { TokenType } from './Lexer';
import PrefixParselet from './parselets/PrefixParselet';
import Statement from './statements/Statement';

export default class Parser {

  constructor (lexer) {
    this._lexer = lexer;
    this._prefixParselets = new Map();
    this._infixParselets = new Map();
    this._statementsParselets = new Map();
  }

  register (token, parselet) {
    if (parselet instanceof PrefixParselet) {
      this._prefixParselets.set(token, parselet);
    }
    else {
      this._infixParselets.set(token, parselet);
    }
  }

  registerStatement (token, statementParselet) {
    this._statementsParselets.set(token, statementParselet);
  }

  parseExpression (precedence = 0) {
    var token = this.consume();
    var prefix = this._prefixParselets.get(token.type);

    if (token.type == TokenType.EOF) {
      token.error('Unexpected end of file.', false);
    }

    if (prefix == null) {
      token.error('Could not parse.');
    }

    var left = prefix.parse(this, token);

    while (precedence < this.getPrecedence()) {
      token = this.consume();

      var infix = this._infixParselets.get(token.type);

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
    var statementParselet = this._statementsParselets.get(token.value);

    if (statementParselet) {
        let statementToken = this.consume();

        return statementParselet.parse(this, statementToken);
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
    var statementParselet = this._statementsParselets.get(token.value);

    this.consume(TokenType.LEFT_CURLY);

    return {
      type: 'BlockStatement',
      body: statementParselet.parse(this)
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
    var parser = this._infixParselets.get(next.type);

    if (parser) {
      return parser.getPrecedence();
    }
    else {
      return 0;
    }
  }
}
