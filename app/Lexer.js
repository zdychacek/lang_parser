/**
 * Token types
 */
export var TokenType = {
  Identifier: 'identifier',
  Literal: 'literal',
  Keyword: 'keyword',
  Punctuator: 'punctuator',
  Boolean: 'boolean',
  String: 'string',
  Number: 'number',
  Null: 'null',
  EOF: 'EOF'
};

/**
 * Punctuators and operators
 */
export var Punctuator = {
  OpenParen: '(',
  CloseParen: ')',
  OpenCurly: '{',
  CloseCurly: '}',
  OpenSquare: '[',
  CloseSquare: ']',
  Comma: ',',
  Assign: '=',
  PlusAssign: '+=',
  MinusAssign: '-=',
  AsteriskAssign: '*=',
  SlashAssign: '/=',
  CaretAssign: '^=',
  Equal: '==',
  StrictEqual: '===',
  NotEqual: '!=',
  StrictNotEqual: '!==',
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

/**
 * JavaScript keywords
 */
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
  Throw: 'throw',
  Delete: 'delete',
  Try: 'try',
  Catch: 'catch',
  Finally: 'finally',
  Debugger: 'debugger',
  With: 'with'
};

/**
 * Expressions precedence
 */
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

/**
 * Values which represent literal values
 */
var literalsValues = [
  'null',
  'true',
  'false'
];

/**
 * These types are literals
 */
var literalsTypes = [
  TokenType.String,
  TokenType.Number,
  TokenType.Boolean,
  TokenType.Null
];

/**
 * Class that represents one token
 */
export class Token {
  constructor ({ type, value, raw = null, start, end }) {
    // type of token (TokenType)
    this.type = type;

    // value of token
    this.value = value;

    // raw value to distinguish between literals types
    this.raw = raw;

    // index, where token starts
    this.start = start;

    // index, where token ends
    this.end = end;
  }
}

/**
 * Class that represents lexer
 */
export class Lexer {
  constructor (text = '') {

    // source code lexer is tokenizing
    this.source = text;
  }

  /**
   * Returns next token
   */
  next () {
    // skip whitespaces and comments
    do {
      this._skipWhitespaces();
    }
    while (this._skipComments());

    // note token start position
    this._marker = this._index;

    // check if we hit eof
    if (this._isEndOfFile()) {
      return this._createToken(TokenType.EOF, TokenType.EOF);
    }

    // try to parse punctuator
    var token = this._scanPunctuator();
    if (token) return token;

    // try to parse numerical value
    token = this._scanNumber();
    if (token) return token;

    // try to parse string
    token = this._scanString();
    if (token) return token;

    // try to parse identifier/keyword
    token = this._scanIdentifier();
    if (token) return token;

    var currChar = this._peekNextChar();

    this.throw(`Unexpected token '${currChar}'`);
  }

  /**
   * Returns token ahead.
   */
  peek (distance = 0) {
    var peeks = [];

    // capture lexer state for revovery purpose
    this.captureState();

    // fill look ahead queue
    while (distance >= peeks.length) {
      peeks.push(this.next());
    }

    // restore lexer state
    this.restoreState();

    return peeks[distance];
  }

  /**
   * Returns true if there is line terminator before next token, otherwise returns false.
   */
  peekLineTerminator () {
    var { lineNo } = this.captureState();

    var token = this.next();
    var nextLineNo = this._lineNo;

    this.restoreState();

    // if lines numbers are not equal, than we found new line
    return lineNo !== nextLineNo;
  }

  /**
   * Capture lexer state (current index, line number and column number). Useful when peeking some token.
   */
  captureState () {
    if (this._capturedState) {
      throw new Error('Trying to capture unrestored state.');
    }

    return this._capturedState = {
      index: this._index,
      lineNo: this._lineNo,
      columnNo: this._columnNo
    };
  }

  /**
   * Restores previously captured state.
   */
  restoreState () {
    if (!this._capturedState) {
      throw new Error('No state to restore.');
    }

    var { index, lineNo, columnNo } = this._capturedState;

    this._index = index;
    this._lineNo = lineNo;
    this._columnNo = columnNo;

    this._capturedState = null;
  }

  /**
   * Reset lexer state.
   */
  reset () {
    // current index in source code
    this._index = 0;

    // start of currently parsed token
    this._marker = 0;

    // current line number in source code
    this._lineNo = 1;

    // current column number in source code
    this._columnNo = 1;

    // reference to lexer captured state
    this._capturedState = null;
  }

  /**
   * Sets new source code and resets parser state.
   */
  set source (src) {
    // reset state before setting new source code
    this.reset();

    this._text = src;
  }

  /**
   * Gets source code.
   */
  get source () {
    return this._text;
  }

  /**
   * Returns array of all tokens.
   */
  dump () {
    var dump = [];

    this.captureState();

    do {
      dump.push(this.next());
    }
    while (!this._isEndOfFile());

    this.restoreState();

    return dump;
  }

  /**
   * Returns current line and column number.
   */
  get lineAndColumn () {
    return {
      line: this._lineNo,
      column: this._columnNo
    };
  }

  /**
   * Throws error with line and column info.
   */
  throw (message, _Error = SyntaxError) {
    var { line, column } = this.lineAndColumn;

    throw new _Error(`ln: ${line}, col: ${column} - ${message}.`);
  }

  /**
   * Tries to parse string literal.
   */
  _scanString () {
    var str = null;
    var char = this._peekNextChar();
    var beginChar = '';

    // string starts with ' or "
    if (char == '\'' || char == '"') {
      beginChar = this._getNextChar();

      char = this._peekNextChar();

      if (char != beginChar) {
        str = '';

        do {
          str += this._getNextChar();
          char = this._peekNextChar();

          if (!char || this._isLineTerminator(char)) {
            this.throw('Unterminated string');
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

  /**
   * Tries to parse numeric literal.
   */
  _scanNumber () {
    var number = '';

    if (this._isDigit(this._peekNextChar())) {
      number += this._getNextChar();

      // hex, octal or binary number
      if (number == '0') {
        let char = this._peekNextChar();

        // hex number
        if (char == 'x') {
          number += this._getNextChar();

          let hexPart = this._scanHexadecimalNumber();

          if (hexPart !== '') {
            number += hexPart;
          }
          else {
            this.throw('Bad hexadecimal number');
          }

          return this._createToken(TokenType.Number, parseInt(number, 16), number);
        }
        // binary number
        else if (char == 'b') {
          number += this._getNextChar();

          let binPart = this._scanBinaryNumber();

          if (binPart !== '') {
            number += binPart;
          }
          else {
            this.throw('Bad binary number');
          }

          return this._createToken(TokenType.Number, parseInt(number.replace('0b', ''), 2), number);
        }

        // if next char is not a number, then we have zero
        if (!this._isDigit(this._peekNextChar())) {
          number += this._scanDecimalNumber();

          return this._createToken(TokenType.Number, parseFloat(number), number);
        }
        // octal number
        else {
          let octalPart = this._scanOctalNumber();

          if (octalPart != '') {
            number += octalPart;
          }
          else {
            this.throw('Bad octal number');
          }

          return this._createToken(TokenType.Number, parseInt(number, 8), number);
        }

      }
      // decimal number
      else {
        number += this._scanDecimalNumber();

        if (number) {
          return this._createToken(TokenType.Number, parseFloat(number), number);
        }
      }
    }
  }

  /**
   * Tries to parse decimal number.
   */
  _scanDecimalNumber () {
    var number = '';
    var char;

    // whole part
    while (this._isDigit(this._peekNextChar())) {
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
          this.throw('Unexpected character after the exponent sign');
        }
      }
    }

    if (number == '.') {
      this.throw('Bad number');
    }

    return number;
  }

  /**
   * Tries to parse octal number.
   */
  _scanOctalNumber () {
    var numberPart = '';

    while (this._isOctalDigit(this._peekNextChar())) {
      numberPart += this._getNextChar();
    }

    return numberPart;
  }

  /**
   * Tries to parse hexadecimal number.
   */
  _scanHexadecimalNumber () {
    var numberPart = '';

    while (this._isHexDigit(this._peekNextChar())) {
      numberPart += this._getNextChar();
    }

    return numberPart;
  }

  /**
   * Tries to parse binary number.
   */
  _scanBinaryNumber () {
    var numberPart = '';

    while (this._isBinaryDigit(this._peekNextChar())) {
      numberPart += this._getNextChar();
    }

    return numberPart;
  }

  /**
   * Tries to parse punctuator or operator.
   */
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
          nextToken = this._peekNextChar();

          if (nextToken == '=') {
            punctuator += this._getNextChar();
          }
        }

        break;
      case Punctuator.Asterisk:
      case Punctuator.Slash:
      case Punctuator.Caret:
      case Punctuator.Bang:
        // these be combined only with equal sign or double equal sign
        punctuator = this._getNextChar();
        nextToken = this._peekNextChar();

        if (nextToken == '=') {
          punctuator += this._getNextChar();
          nextToken = this._peekNextChar();

          if (nextToken == '=') {
            punctuator += this._getNextChar();
          }
        }

        break;
      case Punctuator.Question:
      case Punctuator.Tilde:
      case Punctuator.Colon:
      case Punctuator.Semicolon:
      case Punctuator.OpenParen:
      case Punctuator.CloseParen:
      case Punctuator.OpenCurly:
      case Punctuator.CloseCurly:
      case Punctuator.OpenSquare:
      case Punctuator.CloseSquare:
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

  /**
   * Tries to parse identifier or keyword.
   */
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

  /**
   * Returns current char and increments current index value.
   */
  _getNextChar () {
    var char = this._text[this._index];

    if (this._isLineTerminator(char)) {
      this._lineNo++;
      this._columnNo = 1;
    }
    else {
      this._columnNo++;
    }

    this._index++;

    return char;
  }

  /**
   * Returns char ahead.
   */
  _peekNextChar (distance = 0) {
    return this._text[this._index + distance];
  }

  /**
   * Skips inline and block comments.
   */
  _skipComments () {
    var peek = this._peekNextChar();
    var peek1 = this._peekNextChar(1);
    var char;

    // comments start with // or /* sequence
    if (peek == '/' && (peek1 == '/' || peek1 == '*')) {
      this._getNextChar();
      this._getNextChar();

      // skip inline comments //
      if (peek1 == '/') {
        while (true) {
          char = this._getNextChar();

          if (this._isLineTerminator(char) || this._isEndOfFile()) {
            break;
          }
        }
      }
      // skip block comments /**/
      else {
        var char;
        var peek;

        while (true) {
          char = this._getNextChar();
          peek = this._peekNextChar();

          // unterminated block comment
          if (this._isEndOfFile()) {
            this.throw('Unexpected end of file');
          }

          // block comment terminating sequence */
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

  /**
   * Skips white spaces.
   */
  _skipWhitespaces () {
    while (this._isWhitespace(this._peekNextChar())) {
      this._getNextChar();
    }
  }

  /**
   * Checks if value is keyword.
   */
  _isKeyword (value) {
    for (let kw in Keyword) {
      if (Keyword.hasOwnProperty(kw)) {
        if (Keyword[kw] == value) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks if value is literal value.
   */
  _isLiteralValue (value) {
    return literalsValues.indexOf(value) > -1;
  }

  /**
   * Checks if token type is literal.
   */
  _isLiteralType (tokenType) {
    return literalsTypes.indexOf(tokenType) > -1;
  }

  /**
   * Cheks if char is whitespace.
   */
  _isWhitespace (char) {
    return /\s/.test(char);
  }

  /**
   * Checks if char is line terminator.
   */
  _isLineTerminator (char) {
    return char == '\n';
  }

  /**
   * Checks if we hit end of file.
   */
  _isEndOfFile () {
    return this._index >= this._text.length;
  }

  /**
   * Checks if char is number digit.
   */
  _isDigit (char) {
    return char >= '0' && char <= '9';
  }

  /**
   * Checks if digit is allowed part of octal number;
   */
  _isOctalDigit (char) {
    return char >= '0' && char <= '7';
  }

  /**
   * Checks if digit is allowed part of binary number;
   */
  _isBinaryDigit (char) {
    return char == '0' || char == '1';
  }

  /**
   * Checks if digit is allowed part of hexadecimal number;
   */
  _isHexDigit (char) {
    return (char >= '0' && char <= '9')
      || (char >= 'a' && char <= 'f')
      || (char >= 'A' && char <= 'F');
  }

  /**
   * Checks if char can be identifier first char.
   */
  _isIdentifierStart (char) {
    return char == '_'
      || char == '$'
      || (char >= 'a' && char <= 'z')
      || (char >= 'A' && char <= 'Z');
  }

  /**
   * Checks if char can be contained in identifier name.
   */
  _isIdentifierPart (char) {
    return this._isIdentifierStart(char) || this._isDigit(char);
  }

  /**
   * Helper method, creates new Token class instance.
   */
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
