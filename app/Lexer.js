export var TokenType = {
  Identifier: '(identifier)',
  Literal: '(literal)',
  Keyword: '(keyword)',
  Punctuator: '(punctuator)',
  Boolean: '(boolean)',
  String: '(string)',
  Number: '(number)',
  Null: '(null)',
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
  Dot: '.',
  Increment: '++',
  Decrement: '--'
};

export var Keyword = {
  If: 'if',
  Else: 'else',
  Var: 'var',
  Let: 'let',
  Function: 'function',
  Return: 'return',
  While: 'while',
  Do: 'do',
  Continue: 'continue',
  Break: 'break',
  For: 'for',
  InstanceOf: 'instanceof',
  TypeOf: 'typeof',
  This: 'this',
  In: 'in',
  Switch: 'switch',
  Case: 'case',
  Default: 'default',
  New: 'new',
  Throw: 'throw'
  // TODO: delete, try/catch, debugger, with
};

export var Precedence = {
  Sequence: 5,
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

var literalsValues = [
  'null',
  'true',
  'false'
];

var literalsTypes = [
  TokenType.String,
  TokenType.Number,
  TokenType.Boolean,
  TokenType.Null
];

export class Token {

  constructor ({ type, value, raw = null, start, end }) {
    this.type = type;
    this.value = value;

    // raw value to distinguish between literals types
    this.raw = raw;
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
    // skip whitespaces and comments
    do {
      this._skipWhitespaces();
    }
    while (this._skipComments());

    this._marker = this._index;

    if (this._index >= this._text.length) {
      return this._createToken(TokenType.EOF, TokenType.EOF);
    }

    var token = this._scanPunctuator();
    if (token) return token;

    token = this._scanNumber();
    if (token) return token;

    token = this._scanString();
    if (token) return token;

    token = this._scanIdentifier();
    if (token) return token;

    throw new SyntaxError('Unexpected token \'' + this._peekNextChar() + '\'.');
  }

  peek (distance = 0) {
    var peeks = [];
    var idx = this._index;

    while (distance + 1 > peeks.length) {
      peeks.push(this.next());
    }

    this._index = idx;

    return peeks[distance];
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

  _isLiteralValue (identifier) {
    return literalsValues.indexOf(identifier) > -1;
  }

  _isLiteralType (tokenType) {
    return literalsTypes.indexOf(tokenType) > -1;
  }

  _scanString () {
    var str = null;
    var char = this._peekNextChar();
    var beginChar = '';

    if (char == '\'' || char == '"') {
      beginChar = this._getNextChar();

      char = this._peekNextChar();

      if (char != beginChar) {
        str = '';

        do {
          str += this._getNextChar();
          char = this._peekNextChar();

          if (!char) {
            throw new SyntaxError('Unterminated string.');
          }

          if (char == '\n') {
            throw new SyntaxError('Multiline strings are not allowed.');
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
      return this._createToken(TokenType.String, str, `${beginChar}${str}${beginChar}`);
    }
  }

  _scanNumber () {
    var number = '';
    var char = this._peekNextChar();

    // whole part
    while (this._isDigit(char)) {
      number += this._getNextChar();
      char = this._peekNextChar();
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
      return this._createToken(TokenType.Number, parseFloat(number), number);
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

    var tokenType = TokenType.Identifier;
    var raw;

    if (this._isKeyword(identifier)) {
      tokenType = TokenType.Keyword;
    }
    else if (identifier == 'true' || identifier == 'false') {
      tokenType = TokenType.Boolean;
      raw = identifier;
      identifier = (identifier === 'true');
    }
    else if (identifier == 'null') {
      tokenType = TokenType.Null;
      raw = identifier;
      identifier = null;
    }

    if (identifier !== '') {
      return this._createToken(tokenType, identifier, raw);
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

  _skipComments () {
    var peek = this._peekNextChar();
    var peek1 = this._peekNextChar(1);
    var char;

    if (peek == '/' && (peek1 == '/' || peek1 == '*')) {
      this._getNextChar();
      this._getNextChar();

      // inline comments //
      if (peek1 == '/') {
        while (true) {
          char = this._getNextChar();

          if (char == '\n' || this._index >= this._text.length) {
            break;
          }
        }
      }
      // block comments /**/
      else {
        var char;
        var peek;

        while (true) {
          char = this._getNextChar();
          peek = this._peekNextChar();

          if (this._index >= this._text.length) {
            throw new SyntaxError('Unexpected end of file.');
          }

          if (char == '*' && peek == '/') {
            this._getNextChar();
            this._getNextChar();
            break;
          }
        }
      }

      return true;
    }

    return false;
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

  _createToken (type, value, raw = value) {
    var token = new Token({
      type,
      value,
      raw,
      start: this._marker,
      end: this._index
    });

    return token;
  }
}
