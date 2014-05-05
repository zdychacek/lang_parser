import InfixExpression from './InfixExpression';
import { TokenType, Precedence, Punctuator } from '../Lexer';

export default class ConditionalExpression extends InfixExpression {
  parse (parser, left, token) {
    var consequent = parser.parseExpression();
    parser.consume(Punctuator.Colon);
    var alternate = parser.parseExpression(Precedence.Conditional - 1);

    return {
      type: 'ConditionalExpression',
      test: left,
      consequent,
      alternate
    };
  }

  get precedence () {
    return Precedence.Conditional;
  }
}
