import InfixExpressionParser from './InfixExpressionParser';
import BinaryExpression from '../BinaryExpression';

export default class BinaryOperatorExpressionParser extends InfixExpressionParser {
  constructor (precedence, isRight) {
    this._precedence = precedence;
    this._isRight = isRight;
  }

  parse (parser, left) {
    var token = parser.consume();
    var right = parser.parseExpression(this.precedence - (this._isRight ? 1 : 0));

    return new BinaryExpression(token.value, left, right);
  }

  get precedence () {
    return this._precedence;
  }
}
