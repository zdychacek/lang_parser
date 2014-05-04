import InfixExpression from './InfixExpression';

export default class PostfixOperatorExpression extends InfixExpression {
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

  get precedence () {
    return this._precedence;
  }
}
