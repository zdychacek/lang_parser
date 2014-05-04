import InfixExpression from './InfixExpression';

export default class BinaryOperatorExpression extends InfixExpression {
  constructor (precedence, isRight) {
    this._precedence = precedence;
    this._isRight = isRight;
  }

  parse (parser, left, token) {
    var right = parser.parseExpression(this._precedence - (this._isRight ? 1 : 0));

    return {
      type: 'BinaryExpression',
      operator: token.type,
      left,
      right
    };
  }

  get precedence () {
    return this._precedence;
  }
}
