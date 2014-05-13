import { Punctuator } from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import GroupExpression from '../GroupExpression';

export default class GroupExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var expression = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    return new GroupExpression(expression);
  }
}
