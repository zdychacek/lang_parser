import PrefixExpressionParser from './PrefixExpressionParser';
import ThisExpression from '../ThisExpression';

export default class ThisExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    return new ThisExpression();
  }
}
