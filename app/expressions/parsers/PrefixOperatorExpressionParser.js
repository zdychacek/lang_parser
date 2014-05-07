import PrefixExpressionParser from './PrefixExpressionParser';

export default class PrefixOperatorExpressionParser extends PrefixExpressionParser {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this.precedence);

    return {
      type: 'PrefixExpressionParser',
      operator: token.value,
      right
    };
  }

  get precedence () {
    return this._precedence;
  }
}
