import PrefixExpressionParser from './PrefixExpressionParser';
import LiteralExpression from '../LiteralExpression';

export default class LiteralExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    return new LiteralExpression(token.value, token.raw);
  }
}
