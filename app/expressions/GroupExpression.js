import PrefixExpression from './PrefixExpression';
import { TokenType } from '../Lexer';

export default class GroupExpression extends PrefixExpression {
  parse (parser, token) {
    var expression = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);

    return expression;
  }
}
