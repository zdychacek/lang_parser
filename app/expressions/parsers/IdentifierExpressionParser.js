import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpression from '../IdentifierExpression';
import { TokenType } from '../../Lexer';

export default class IdentifierExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consumeType(TokenType.Identifier);
    var id = token.value;

    return new IdentifierExpression(id);
  }
}
