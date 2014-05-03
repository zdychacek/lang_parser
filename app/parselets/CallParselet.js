import InfixParselet from './InfixParselet';
import Precedence from '../Precedence';
import { TokenType } from '../Lexer';

export default class CallParselet extends InfixParselet {
  parse (parser, left, token) {
    var args = [];

    // There may be no arguments at all.
    if (!parser.match(TokenType.RIGHT_PAREN)) {
      do {
        args.push(parser.parseExpression());
      } while (parser.match(TokenType.COMMA));

      parser.consume(TokenType.RIGHT_PAREN);
    }

    return {
      'CallExpression': {
        function: left,
        args
      }
    };
  }

  getPrecedence () {
    return Precedence.CALL;
  }
}
