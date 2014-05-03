import InfixParselet from './InfixParselet';
import Precedence from '../Precedence';

export default class AssignmentParselet extends InfixParselet {
  parse (parser, left, token) {
    var right = parser.parseExpression(Precedence.ASSIGNMENT - 1);

    // TODO:
    if (!left.type == 'Identifier') {
      throw new SyntaxError('The left-hand side of an assignment must be an identifier.');
    }

    return {
      type: 'Assignment',
      name: left.name,
      right
    };
  }

  getPrecedence () {
    return Precedence.ASSIGNMENT;
  }
}
