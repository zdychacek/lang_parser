import PrefixParselet from './PrefixParselet';

export default class PrefixOperatorParselet extends PrefixParselet {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this._precedence);

    return {
      'PrefixExpression': {
        operator: token.type,
        right
      }
    };
  }

  getPrecedence () {
    return this._precedence;
  }
}
