function PrefixParselet () { }

PrefixParselet.prototype = {
  parse: function (parser, token) {
    throw new Error('Not implemented.');
  }
};

function InfixParselet () { }

InfixParselet.prototype = {
  parse: function (parser, left, token) {
    throw new Error('Not implemented.');
  },

  getPrecedence: function () {
    throw new Error('Not implemented.');
  }
};

////// AssignParselet
function AssignParselet () {}
AssignParselet.extends(InfixParselet);

AssignParselet.prototype.parse = function (parser, left, token) {
  var right = parser.parseExpression(Precedence.ASSIGNMENT - 1);

  // TODO:
  if (!left.NameExpression) {
    throw new Error('The left-hand side of an assignment must be a name.');
  }

  var name = left.NameExpression.name;

  return {
    'AssignExpression': {
      name: name,
      right: right
    }
  }
}

AssignParselet.prototype.getPrecedence = function () {
  return Precedence.ASSIGNMENT;
}

////// BinaryOperatorParselet
function BinaryOperatorParselet (precedence, isRight) {
  this._precedence = precedence;
  this._isRight = isRight;
}
BinaryOperatorParselet.extends(InfixParselet);

BinaryOperatorParselet.prototype.

BinaryOperatorParselet.prototype.getPrecedence = function () {
  return this._precedence;
}

////// CallParselet
function CallParselet () {}
CallParselet.extends(InfixParselet);

CallParselet.prototype.parse = function (parser, left, token) {
  var args = [];

  // There may be no arguments at all.
  if (!parser.match(TokenType.RIGHT_PAREN)) {
    do {
      args.push(parser.parseExpression());
    } while (parser.match(TokenType.COMMA));

    parser.consume(TokenType.RIGHT_PAREN);
  }

  return {
    'CallExpression': {
      function: left,
      args: args
    }
  };
}

CallParselet.prototype.getPrecedence = function () {
  return Precedence.CALL;
}

////// ConditionalParselet
function ConditionalParselet () {}
ConditionalParselet.extends(InfixParselet);

ConditionalParselet.prototype.parse = function (parser, left, token) {

}

ConditionalParselet.prototype.getPrecedence = function () {
  return Precedence.CONDITIONAL;
}

////// GroupParselet
function GroupParselet () {}
GroupParselet.extends(PrefixParselet);

GroupParselet.prototype.parse = function (parser, token) {
  var expression = parser.parseExpression();
  parser.consume(TokenType.RIGHT_PAREN);

  return expression;
}

////// IdentifierParselet
function IdentifierParselet () {}
IdentifierParselet.extends(PrefixParselet);

IdentifierParselet.prototype.parse = function (parser, token) {
  return {
    'NameExpression': {
      name: token.getText()
    }
  };
}

////// PostfixOperatorParselet
function PostfixOperatorParselet (precedence) {
  this._precedence = precedence;
}
PostfixOperatorParselet.extends(InfixParselet);

PostfixOperatorParselet.prototype.parse = function (parser, left, token) {
  return {
    'PostfixExpression': {
      left: left,
      operator: token.getType()
    }
  };
}

PostfixOperatorParselet.prototype.getPrecedence = function () {
  return this._precedence;
}

////// PrefixOperatorParselet
function PrefixOperatorParselet (precedence) {
  this._precedence = precedence;
}
PrefixOperatorParselet.extends(PrefixParselet);

PrefixOperatorParselet.prototype.parse = function (parser, token) {
  var right = parser.parseExpression(this._precedence);

  return {
    'PrefixExpression': {
      operator: token.getType(),
      right: right
    }
  };
}

PrefixOperatorParselet.prototype.getPrecedence = function () {
  return this._precedence;
}
