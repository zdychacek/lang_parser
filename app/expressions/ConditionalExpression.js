import InfixExpression from './InfixExpression';
import { TokenType } from '../Lexer';
import Precedence from '../Precedence';

export default class ConditionalExpression extends InfixExpression {
  parse (parser, left, token) {
    var consequent = parser.parseExpression();
    parser.consume(TokenType.COLON);
    var alternate = parser.parseExpression(Precedence.CONDITIONAL - 1);

    return {
      type: 'ConditionalExpression',
      test: left,
      consequent,
      alternate
    };
  }

  get precedence () {
    return Precedence.CONDITIONAL;
  }
}
