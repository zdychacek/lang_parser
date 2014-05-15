import PrefixExpressionParser from './PrefixExpressionParser';
import ThisExpression from '../ThisExpression';
import { Keyword } from '../../Lexer';

export default class ThisExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    parser.consume(Keyword.This);

    return new ThisExpression();
  }
}
