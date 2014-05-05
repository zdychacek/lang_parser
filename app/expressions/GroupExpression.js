import PrefixExpression from './PrefixExpression';
import { TokenType, Punctuator } from '../Lexer';

export default class GroupExpression extends PrefixExpression {
  parse (parser, token) {
    var expression = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    return expression;
  }
}
