import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpression from '../IdentifierExpression';

export default class IdentifierExpressionParser extends PrefixExpressionParser {
  parse (parser, withoutDefinitionCheck = false) {
    var token = parser.consume();

    var id = token.value;

    if (!withoutDefinitionCheck && !parser.scope.isVariableDefined(id)) {
      parser.throw(`'${id}' is not defined`, ReferenceError);
    }

    return new IdentifierExpression(id);
  }
}
