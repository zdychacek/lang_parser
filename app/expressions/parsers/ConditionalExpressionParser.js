import InfixExpressionParser from './InfixExpressionParser';
import { TokenType, Precedence, Punctuator } from '../../Lexer';

export default class ConditionalExpressionParserParser extends InfixExpressionParser {
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
