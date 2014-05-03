import InfixParselet from './InfixParselet';

export default class PostfixOperatorParselet extends InfixParselet {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, left, token) {
    return {
      'PostfixExpression': {
        left,
        operator: token.type
      }
    };
  }

  getPrecedence () {
    return this._precedence;
  }
}
