import InfixExpressionParser from './InfixExpressionParser';
import { TokenType, Precedence, Punctuator } from '../../Lexer';
import ConditionalExpression from '../ConditionalExpression';

export default class ConditionalExpressionParser extends InfixExpressionParser {
  parse (parser, test, token) {
    var consequent = parser.parseExpression();
    parser.consume(Punctuator.Colon);
    var alternate = parser.parseExpression(this.precedence - 1);

    return new ConditionalExpression(test, consequent, alternate);
  }

  get precedence () {
    return Precedence.Conditional;
  }
}
