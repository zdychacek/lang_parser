import {
  TokenType,
  Precedence,
  Punctuator
} from '../../Lexer';
import InfixExpressionParser from './InfixExpressionParser';
import ConditionalExpression from '../ConditionalExpression';

export default class ConditionalExpressionParser extends InfixExpressionParser {
  parse (parser, test) {
    var token = parser.consume(Punctuator.Question);

    var consequent = parser.parseExpression();
    parser.consume(Punctuator.Colon);
    var alternate = parser.parseExpression(this.precedence - 1);

    return new ConditionalExpression(test, consequent, alternate);
  }

  get precedence () {
    return Precedence.Conditional;
  }
}
