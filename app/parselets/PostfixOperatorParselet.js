import InfixParselet from './InfixParselet';

export default class PostfixOperatorParselet extends InfixParselet {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, left, token) {
    return {
      type: 'PostfixExpression',
      operator: token.type,
      left
    };
  }

  getPrecedence () {
    return this._precedence;
  }
}
