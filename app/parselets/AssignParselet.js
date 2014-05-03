import InfixParselet from './InfixParselet';
import Precedence from '../Precedence';

export default class AssignParselet extends InfixParselet {
  parse (parser, left, token) {
    var right = parser.parseExpression(Precedence.ASSIGNMENT - 1);

    // TODO:
    if (!left.Identifier) {
      throw new Error('The left-hand side of an assignment must be a name.');
    }

    var name = left.Identifier.name;

    return {
      'AssignExpression': {
        name,
        right
      }
    };
  }

  getPrecedence () {
    return Precedence.ASSIGNMENT;
  }
}
