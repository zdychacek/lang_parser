import InfixParselet from './InfixParselet';
import Precedence from '../Precedence';
import { TokenType } from '../Lexer';

export default class CallParselet extends InfixParselet {
  parse (parser, left, token) {
    var args = [];

    // There may be no arguments at all.
    if (!parser.matchAndConsume(TokenType.RIGHT_PAREN)) {
      do {
        args.push(parser.parseExpression());
      } while (parser.matchAndConsume(TokenType.COMMA));

      parser.consume(TokenType.RIGHT_PAREN);
    }

    return {
      type: 'CallExpression',
      callee: left,
      args
    };
  }

  getPrecedence () {
    return Precedence.CALL;
  }
}
