import PrefixExpression from './PrefixExpression';

class PrefixOperatorExpression extends PrefixExpression {
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

export default PrefixOperatorExpression;
