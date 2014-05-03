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

  parseExpression (precedence) {
    precedence = precedence || 0;

    var token = this.consume();
    var prefix = this._prefixParselets.get(token.type);

    if (token.type == TokenType.EOF) {
      throw new SyntaxError('Unexpected end of file.');
    }

    if (prefix == null) {
      throw new SyntaxError('Could not parse \'' + token.value + '\'.');
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
      let token = this.peek();

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
        this.consume();
        return statementParselet.parse(this);
    }
    else {
      let expr = this.parseExpression();
      this.consume(TokenType.SEMICOLON);

      return expr;
    }
  }

  parseBlock () {
    var token = this.peek();
    var statementParselet = this._statementsParselets.get(token.value);

    this.consume(TokenType.LEFT_CURLY);

    return statementParselet.parse(this);
  }

  matchAndConsume (expected) {
    var token = this.peek();

    if (token.type != expected && token.value != expected) {
      return false;
    }

    this.consume();

    return true;
  }

  match (expected) {
    var token = this.peek();

    if (token.type != expected && token.value != expected) {
      return false;
    }

    return true;
  }

  consume (expected) {
    if (expected) {
      var token = this.peek();

      if (token.type != expected && token.value != expected) {
        throw new SyntaxError('Expected token ' + expected + ' and found ' + token.type);
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
