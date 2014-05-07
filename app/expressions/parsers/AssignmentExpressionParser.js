import InfixExpressionParser from './InfixExpressionParser';
import { TokenType, Precedence } from '../../Lexer';
import IdentifierExpression from '../IdentifierExpression';
import AssignmentExpression from '../AssignmentExpression';

export default class AssignmentExpressionParser extends InfixExpressionParser {
  parse (parser, left, token) {
    var right = parser.parseExpression(this.precedence - 1);

    if (!(left instanceof IdentifierExpression)) {
      throw new Error('The left-hand side of an assignment must be an identifier.');
    }

    return new AssignmentExpression(token.value, left, right);
  }

  get precedence () {
    return Precedence.Assignment;
  }
}
