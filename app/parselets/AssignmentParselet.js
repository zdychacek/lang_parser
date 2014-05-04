import InfixParselet from './InfixParselet';
import Precedence from '../Precedence';
import { TokenType } from '../Lexer';

export default class AssignmentParselet extends InfixParselet {
  parse (parser, left, token) {
    var right = parser.parseExpression(Precedence.ASSIGNMENT - 1);

    if (left.type != TokenType.IDENTIFIER) {
      left.error('The left-hand side of an assignment must be an identifier.');
    }

    return {
      type: 'AssignmentExpression',
      operator: token.type,
      left,
      right
    };
  }

  getPrecedence () {
    return Precedence.ASSIGNMENT;
  }
}
