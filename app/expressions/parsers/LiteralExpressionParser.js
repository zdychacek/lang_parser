import PrefixExpressionParser from './PrefixExpressionParser';
import LiteralExpression from '../LiteralExpression';
import { TokenType } from '../../Lexer';

export default class LiteralExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consumeType(TokenType.Literal);

    return new LiteralExpression(token.value, token.raw);
  }
}
