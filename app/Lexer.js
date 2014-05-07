export var TokenType = {
  Identifier: '(identifier)',
  Literal: '(literal)',
  Keyword: '(keyword)',
  Punctuator: '(punctuator)',
  EOF: '(EOF)'
};

export var Punctuator = {
  LeftParen: '(',
  RightParen: ')',
  LeftCurly: '{',
  RightCurly: '}',
  LeftSquare: '[',
  RightSquare: ']',
  Comma: ',',
  Assign: '=',
  PlusAssign: '+=',
  MinusAssign: '-=',
  AsteriskAssign: '*=',
  SlashAssign: '/=',
  CaretAssign: '^=',
  Equal: '==',
  NotEqual: '!=',
  Greater: '>',
  GreaterEqual: '>=',
  Less: '<',
  LessEqual: '<=',
  BitwiseAnd: '&',
  LogicalAnd: '&&',
  BitwiseOr: '|',
  LogicalOr: '||',
  Plus: '+',
  Minus: '-',
  Asterisk: '*',
  Slash: '/',
  Caret: '^',
  Tilde: '~',
  Bang: '!',
  Question: '?',
  Colon: ':',
  Semicolon: ';',
  Dot: '.'
};

export var Keyword = {
  If: 'if',
  Else: 'else',
  Var: 'var',
  Let: 'let',
  Function: 'function',
  Return: 'return'
};

export var Precedence = {
  Assignment: 10,
  Conditional: 20,
  LogicalOr: 30,
  LogicalAnd: 31,
  BitwiseOr: 32,
  BitwiseAnd: 33,
  Relational: 40,
  Sum: 50,
  Product: 60,
  Exponent: 70,
  Prefix: 80,
  Postfix: 90,
  Call: 100,
  Member: 110
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

    var token = this._scanPunctuator();
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
      return this._createToken(TokenType.Literal, str);
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
      return this._createToken(TokenType.Literal, parseFloat(number));
    }
  }

  _scanPunctuator () {
    var nextToken = this._peekNextChar(), prevToken;
    var punctuator = '';

    switch (nextToken) {
      case Punctuator.BitwiseAnd:
      case Punctuator.BitwiseOr:

        // & and | can only be duplicated
        prevToken = nextToken;
        punctuator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == prevToken) {
          punctuator += this._getNextChar();
        }

        break;
      case Punctuator.Plus:
      case Punctuator.Minus:
      case Punctuator.Assign:
      case Punctuator.Less:
      case Punctuator.Greater:
        // these can be combined with itself or with equal sign
        prevToken = nextToken;
        punctuator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == prevToken || nextToken == '=') {
          punctuator += this._getNextChar();
        }

        break;
      case Punctuator.Asterisk:
      case Punctuator.Slash:
      case Punctuator.Caret:
      case Punctuator.Bang:
        // these be combined only with equal sign
        punctuator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == '=') {
          punctuator += this._getNextChar();
        }

        break;
      case Punctuator.Question:
      case Punctuator.Tilde:
      case Punctuator.Colon:
      case Punctuator.Semicolon:
      case Punctuator.LeftParen:
      case Punctuator.RightParen:
      case Punctuator.LeftCurly:
      case Punctuator.RightCurly:
      case Punctuator.LeftSquare:
      case Punctuator.RightSquare:
      case Punctuator.Comma:
      case Punctuator.Dot:
        // one char operators
        punctuator += this._getNextChar();
        break;
    }

    if (punctuator) {
      return this._createToken(TokenType.Punctuator, punctuator);
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
      return this._createToken(this._isKeyword(identifier)? TokenType.Keyword : TokenType.Identifier, identifier);
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
