import InfixParselet from './InfixParselet';
import { TokenType } from '../Lexer';
import Precedence from '../Precedence';

export default class ConditionalParselet extends InfixParselet {
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

  getPrecedence () {
    return Precedence.CONDITIONAL;
  }
}
