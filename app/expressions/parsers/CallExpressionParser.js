import InfixExpressionParser from './InfixExpressionParser';
import { TokenType, Precedence, Punctuator } from '../../Lexer';
import CallExpression from '../CallExpression';

export default class CallExpressionParser extends InfixExpressionParser {
  parse (parser, callee, token) {
    var args = [];

    if (!parser.matchAndConsume(Punctuator.RightParen)) {
      do {
        args.push(parser.parseExpression());
      } while (parser.matchAndConsume(Punctuator.Comma));

      parser.consume(Punctuator.RightParen);
    }

    return new CallExpression(callee, args);
  }

  get precedence () {
    return Precedence.Call;
  }
}
