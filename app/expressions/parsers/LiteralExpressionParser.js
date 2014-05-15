import PrefixExpressionParser from './PrefixExpressionParser';
import LiteralExpression from '../LiteralExpression';

export default class LiteralExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consume();

    return new LiteralExpression(token.value, token.raw);
  }
}
