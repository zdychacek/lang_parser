import PrefixExpressionParser from './PrefixExpressionParser';
import { Precedence } from '../../Lexer';
import UnaryExpression from '../UnaryExpression';

export default class UnaryExpressionParser extends PrefixExpressionParser {
  constructor (precedence) {
    this._precedence = precedence;
  }

  parse (parser, token) {
    var right = parser.parseExpression(this.precedence);

    return new UnaryExpression(token.value, right);
  }

  get precedence () {
    return this._precedence;
  }
}
