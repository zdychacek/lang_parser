import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpression from '../IdentifierExpression';
import { TokenType } from '../../Lexer';

export default class IdentifierExpressionParser extends PrefixExpressionParser {
  parse (parser, withoutDefinitionCheck = false) {
    var token = parser.consumeType(TokenType.Identifier);
    var id = token.value;

    if (!withoutDefinitionCheck && !parser.scope.isVariableDefined(id)) {
      parser.addWarning(`'${id}' is not defined`);
    }

    return new IdentifierExpression(id);
  }
}
