import InfixExpressionParser from './InfixExpressionParser';

export default class PostfixOperatorExpressionParser extends InfixExpressionParser {
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
