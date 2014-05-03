import PrefixParselet from './PrefixParselet';
import { TokenType } from '../Lexer';

export default class GroupParselet extends PrefixParselet {
  parse (parser, token) {
    var expression = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);

    return expression;
  }
}
