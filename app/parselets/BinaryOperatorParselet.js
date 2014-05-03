import InfixParselet from './InfixParselet';

export default class BinaryOperatorParselet extends InfixParselet {
  constructor (precedence, isRight) {
    this._precedence = precedence;
    this._isRight = isRight;
  }

  parse (parser, left, token) {
    var right = parser.parseExpression(this._precedence - (this._isRight ? 1 : 0));

    return {
      type: 'Operator',
      left,
      operator: token.type,
      right
    };
  }

  getPrecedence () {
    return this._precedence;
  }
}
