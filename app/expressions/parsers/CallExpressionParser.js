import {
  TokenType,
  Precedence,
  Punctuator
} from '../../Lexer';
import InfixExpressionParser from './InfixExpressionParser';
import CallExpression from '../CallExpression';

export default class CallExpressionParser extends InfixExpressionParser {
  parse (parser, callee) {
    var token = parser.consume(Punctuator.OpenParen);
    var args = [];

    if (!parser.matchAndConsume(Punctuator.CloseParen)) {
      do {
        args.push(parser.parseExpression(Precedence.Sequence));
      } while (parser.matchAndConsume(Punctuator.Comma));

      parser.consume(Punctuator.CloseParen);
    }

    return new CallExpression(callee, args);
  }

  get precedence () {
    return Precedence.Call;
  }
}
