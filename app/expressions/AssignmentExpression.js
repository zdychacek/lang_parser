import InfixExpression from './InfixExpression';
import { TokenType, Precedence } from '../Lexer';

export default class AssignmentExpression extends InfixExpression {
  parse (parser, left, token) {
    var right = parser.parseExpression(Precedence.Assignment - 1);

    if (left.type != 'Identifier') {
      throw new Error('The left-hand side of an assignment must be an identifier.');
    }

    return {
      type: 'AssignmentExpression',
      operator: token.type,
      left,
      right
    };
  }

  get precedence () {
    return Precedence.Assignment;
  }
}
