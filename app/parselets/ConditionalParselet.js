import InfixParselet from './InfixParselet';
import { TokenType } from '../Lexer';
import Precedence from '../Precedence';

export default class ConditionalParselet extends InfixParselet {
  parse (parser, left, token) {
    var thenArm = parser.parseExpression();
    parser.consume(TokenType.COLON);
    var elseArm = parser.parseExpression(Precedence.CONDITIONAL - 1);

    return {
      type: 'Conditional',
      condition: left,
      thenArm: thenArm,
      elseArm: elseArm
    };
  }

  getPrecedence () {
    return Precedence.CONDITIONAL;
  }
}
