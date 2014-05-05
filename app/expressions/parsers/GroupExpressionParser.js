import PrefixExpressionParser from './PrefixExpressionParser';
import { Punctuator } from '../../Lexer';

export default class GroupExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var expression = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    return expression;
  }
}
