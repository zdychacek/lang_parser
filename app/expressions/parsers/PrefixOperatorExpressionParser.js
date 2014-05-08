import PrefixExpressionParser from './PrefixExpressionParser';
import PrefixExpression from '../PrefixExpression';

export default class PrefixOperatorExpressionParser extends PrefixExpressionParser {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this.precedence);

    return new PrefixExpression(token.value, right);
  }

  get precedence () {
    return this._precedence;
  }
}
