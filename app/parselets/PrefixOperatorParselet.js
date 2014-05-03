import PrefixParselet from './PrefixParselet';

class PrefixOperatorParselet extends PrefixParselet {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this._precedence);

    return {
      type: 'PrefixExpression',
      operator: token.type,
      right
    };
  }

  getPrecedence () {
    return this._precedence;
  }
}

export default PrefixOperatorParselet;
