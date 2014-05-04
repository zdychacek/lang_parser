export var TokenType = {
  LEFT_PAREN: '(',
  RIGHT_PAREN: ')',
  LEFT_CURLY: '{',
  RIGHT_CURLY: '}',
  COMMA: ',',
  ASSIGN: '=',
  PLUS_ASSIGN: '+=',
  MINUS_ASSIGN: '-=',
  ASTERISK_ASSIGN: '*=',
  SLASH_ASSIGN: '/=',
  CARET_ASSIGN: '^=',
  EQUAL: '==',
  NOT_EQUAL: '!=',
  GREATER: '>',
  GREATER_OR_EQUAL: '>=',
  LESS: '<',
  LESS_OR_EQUAL: '<=',
  LOGICAL_AND: '&&',
  AMPERSAND: '&',
  PIPE: '|',
  LOGICAL_OR: '||',
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
  LITERAL: '(literal)',
  KEYWORD: '(keyword)',
  EOF: '(EOF)'
};

export var Keyword = {
  IF: 'if',
  ELSE: 'else',
  VAR: 'var',
  LET: 'let',
  FUNCTION: 'function'
};

export class Token {

  constructor ({ type, value, start, end }) {
    this.type = type;
    this.value = value;
    this.start = start;
    this.end = end;
  }

  error (msg, printInfo = true) {
    throw new SyntaxError(msg + (printInfo? ` (value: "${this.value}", start: ${this.start}, end: ${this.end})` : ''));
  }
}

export class Lexer {
  constructor (text = '') {
    this.source = text;
  }

  next () {
    this._skipWhitespaces();

    this._marker = this._index;

    if (this._index >= this._text.length) {
      return this._createToken(TokenType.EOF, TokenType.EOF);
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

  reset () {
    this._index = 0;
    this._marker = 0;
  }

  set source (src) {
    this.reset();
    this._text = src;
  }

  get source () {
    return this._text;
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
      let beginChar = this._getNextChar();

      char = this._peekNextChar();

      if (char != beginChar) {
        str = '';

        do {
          str += this._getNextChar();
          char = this._peekNextChar();

          if (!char) {
            throw new SyntaxError('Unterminated string.');
          }
        } while (char != beginChar);

        this._getNextChar();
      }
      else {
        str = '';

        this._getNextChar();
      }
    }

    if (str !== null) {
      return this._createToken(TokenType.LITERAL, str);
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
      return this._createToken(TokenType.LITERAL, parseFloat(number));
    }
  }

  _scanOperator () {
    var nextToken = this._peekNextChar(), prevToken;
    var operator = '';

    switch (nextToken) {
      case TokenType.AMPERSAND:
      case TokenType.PIPE:

        // & and | can only be duplicated
        prevToken = nextToken;
        operator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == prevToken) {
          operator += this._getNextChar();
        }

        break;
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.ASSIGN:
      case TokenType.LESS:
      case TokenType.GREATER:
        // these can be combined with itself or with equal sign
        prevToken = nextToken;
        operator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == prevToken || nextToken == '=') {
          operator += this._getNextChar();
        }

        break;
      case TokenType.ASTERISK:
      case TokenType.SLASH:
      case TokenType.CARET:
      case TokenType.BANG:
        // these be combined only with equal sign
        operator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == '=') {
          operator += this._getNextChar();
        }

        break;
      case TokenType.QUESTION:
      case TokenType.TILDE:
      case TokenType.COLON:
      case TokenType.SEMICOLON:
      case TokenType.LEFT_PAREN:
      case TokenType.RIGHT_PAREN:
      case TokenType.LEFT_CURLY:
      case TokenType.RIGHT_CURLY:
      case TokenType.COMMA:
        // one char operators
        operator += this._getNextChar();
        break;
    }

    if (operator) {
      return this._createToken(operator);
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

  _peekNextChar (distance = 0) {
    return this._text[this._index + distance];
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

  _createToken (type, value = type) {
    return new Token({
      type,
      value,
      start: this._marker,
      end: this._index
    });
  }
}
