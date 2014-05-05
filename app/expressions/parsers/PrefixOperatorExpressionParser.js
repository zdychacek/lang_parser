import PrefixExpressionParser from './PrefixExpressionParser';

class PrefixOperatorExpressionParser extends PrefixExpressionParser {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this._precedence);

    return {
      type: 'PrefixExpressionParser',
      operator: token.type,
      right
    };
  }

  get precedence () {
    return this._precedence;
  }
}

export default PrefixOperatorExpressionParser;
