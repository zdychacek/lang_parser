import { TokenType } from './Lexer';
import PrefixParselet from './parselets/PrefixParselet';

export default class Parser {
  constructor (lexer) {
    this._lexer = lexer;
    this._read = [];
    this._prefixParselets = new Map();
    this._infixParselets = new Map();
  }

  register (token, parselet) {
    if (parselet instanceof PrefixParselet) {
      this._prefixParselets.set(token, parselet);
    }
    else {
      this._infixParselets.set(token, parselet);
    }
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

  match (expected) {
    var token = this.peek();

    if (token.type != expected) {
      return false;
    }

    this.consume();

    return true;
  }

  consume (expected) {
    if (expected) {
      var token = this.peek();

      if (token.type != expected) {
        throw new SyntaxError('Expected token ' + expected + ' and found ' + token.type);
      }

      return this._lexer.next();
    }
    else {
      return this._lexer.next();
    }
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
