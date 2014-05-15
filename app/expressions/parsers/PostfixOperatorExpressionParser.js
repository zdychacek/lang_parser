import InfixExpressionParser from './InfixExpressionParser';
import PostfixExpression from '../PostfixExpression';

export default class PostfixOperatorExpressionParser extends InfixExpressionParser {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, left) {
    var token = parser.consume();

    return new PostfixExpression(token.value, left);
  }

  get precedence () {
    return this._precedence;
  }
}
