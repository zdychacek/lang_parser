import InfixExpressionParser from './InfixExpressionParser';

export default class BinaryOperatorExpressionParser extends InfixExpressionParser {
  constructor (precedence, isRight) {
    this._precedence = precedence;
    this._isRight = isRight;
  }

  parse (parser, left, token) {
    var right = parser.parseExpression(this.precedence - (this._isRight ? 1 : 0));

    return {
      type: 'BinaryExpression',
      operator: token.value,
      left,
      right
    };
  }

  get precedence () {
    return this._precedence;
  }
}
