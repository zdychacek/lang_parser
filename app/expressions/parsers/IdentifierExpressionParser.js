import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpression from '../IdentifierExpression';

export default class IdentifierExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    return new IdentifierExpression(token.value);
  }
}
