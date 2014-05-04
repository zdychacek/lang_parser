import InfixExpression from './InfixExpression';
import Precedence from '../Precedence';
import { TokenType } from '../Lexer';

export default class CallExpression extends InfixExpression {
  parse (parser, left, token) {
    var args = [];

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

  get precedence () {
    return Precedence.CALL;
  }
}