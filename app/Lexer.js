export var TokenType = {
  LEFT_PAREN: '(',
  RIGHT_PAREN: ')',
  LEFT_CURLY: '{',
  RIGHT_CURLY: '}',
  COMMA: ',',
  ASSIGN: '=',
  PLUS: '+',
  MINUS: '-',
  ASTERISK: '*',
  SLASH: '/',
  CARET: '^',
  TILDE: '~',
  BANG: '!',
  QUESTION: '?',
  COLON: ':',
  SEMICOLON: ';',
  IDENTIFIER: '(identifier)',
  NUMBER: '(number)',
  STRING: '(string)',
  KEYWORD: '(keyword)',
  EOF: '(eof)'
};

export var Keyword = {
  IF: 'if',
  ELSE: 'else'
};

export class Token {
  constructor ({ type, value, start, end }) {
    this.type = type;
    this.value = value;
    this.start = start;
    this.end = end;
  }
}

export class Lexer {
  constructor (text) {
    this._index = 0;
    this._text = text;
    this._marker = 0;
    this._puctuators = [];

    for (let type in TokenType) {
      if (TokenType.hasOwnProperty(type) && ['IDENTIFIER', 'NUMBER', 'STRING', 'EOF'].indexOf(type) == -1) {
        this._puctuators.push(TokenType[type]);
      }
    }
  }

  next () {
    this._skipWhitespaces();

    this._marker = this._index;

    if (this._index >= this._text.length) {
      return this._createToken(TokenType.EOF, '');
    }

    var token = this._scanOperator();
    if (token) return token;

    token = this._scanString();
    if (token) return token;

    token = this._scanNumber();
    if (token) return token;

    token = this._scanIdentifier();
    if (token) return token;

    throw new SyntaxError('Unexpected token \'' + this._peekNextChar() + '\'.');
  }

  peek () {
    var idx = this._index;
    var token = this.next();

    this._index = idx;

    return token;
  }

  dump () {
    var dump = [];
    var idx = this._index;
    var token;

    while (true) {
      token = this.next();

      if (token.type == TokenType.EOF) {
        break;
      }

      dump.push(token);
    }

    this._index = idx;

    return dump;
  }

  _isKeyword (identifier) {
    for (let kw in Keyword) {
      if (Keyword[kw] == identifier) {
        return true;
      }
    }

    return false;
  }

  _scanString () {
    var str = null;
    var char = this._peekNextChar();

    if (char == '\'' || char == '"') {
      let beginChar = char;

      this._getNextChar();
      char = this._peekNextChar();

      if (char != beginChar) {
        str = '';

        do {
          str += this._getNextChar();
          char = this._peekNextChar();

          if (!char) {
            throw new SyntaxError('Unterminated string (misssing: ' + beginChar + ').');
          }
        } while (char != beginChar);

        this._getNextChar();
      }
      else {
        str = '';
      }
    }

    if (str) {
      return this._createToken(TokenType.STRING, str);
    }
  }

  _scanNumber () {
    var number = '';
    var char = this._peekNextChar();

    // whole part
    if (this._isDigit(char)) {
      number += this._getNextChar();
    }

    char = this._peekNextChar();

    // decimal separator
    if (char == '.') {
      number += this._getNextChar();
    }

    char = this._peekNextChar();

    // fractional part
    while (this._isDigit(char)) {
      number += this._getNextChar();
      char = this._peekNextChar();
    }

    if (number) {
      char = this._peekNextChar();

      // exponential notation
      if (char == 'e' || char == 'E') {
        number += this._getNextChar();
        char = this._peekNextChar();

        if (this._isDigit(char) || char == '+' || char == '-') {
          number += this._getNextChar();

          while (true) {
            char = this._peekNextChar();

            if (!this._isDigit(char)) {
                break;
            }
            number += this._getNextChar();
          }
        }
        else {
          throw new SyntaxError('Unexpected character after the exponent sign.');
        }
      }
    }

    if (number == '.') {
      throw new SyntaxError('Bad number.');
    }

    if (number) {
      return this._createToken(TokenType.NUMBER, parseFloat(number));
    }
  }

  _scanOperator () {
    var char = this._peekNextChar();

    if (this._puctuators.indexOf(char) > -1) {
      var operator = this._getNextChar();

      return this._createToken(char, operator);
    }
  }

  _scanIdentifier () {
    var char = this._peekNextChar();
    var identifier = '';

    if (this._isIdentifierStart(char)) {
      identifier += this._getNextChar();
    }

    char = this._peekNextChar();

    while (this._isIdentifierPart(char)) {
      identifier += this._getNextChar();
      char = this._peekNextChar();
    }

    if (identifier) {
      return this._createToken(this._isKeyword(identifier)? TokenType.KEYWORD : TokenType.IDENTIFIER, identifier);
    }
  }

  _getNextChar () {
    var char = this._text[this._index];

    this._index++;

    return char;
  }

  _peekNextChar () {
    return this._text[this._index];
  }

  _skipWhitespaces () {
    while (this._isWhitespace(this._peekNextChar())) {
      this._getNextChar();
    }
  }

  _isWhitespace (char) {
    return /\s/.test(char);
  }

  _isDigit (char) {
    return (char >= '0') && (char <= '9');
  }

  _isIdentifierStart (char) {
    return char == '_' || char == '$' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  _isIdentifierPart (char) {
    return this._isIdentifierStart(char) || this._isDigit(char);
  }

  _createToken (type, value) {
    return new Token({
      type,
      value,
      start: this._marker,
      end: this._index
    });
  }
}
