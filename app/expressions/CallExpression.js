import InfixExpression from './InfixExpression';
import { TokenType, Precedence, Punctuator } from '../Lexer';

export default class CallExpression extends InfixExpression {
  parse (parser, left, token) {
    var args = [];

    if (!parser.matchAndConsume(Punctuator.RightParen)) {
      do {
        args.push(parser.parseExpression());
      } while (parser.matchAndConsume(Punctuator.Comma));

      parser.consume(Punctuator.RightParen);
    }

    return {
      type: 'CallExpression',
      callee: left,
      args
    };
  }

  get precedence () {
    return Precedence.Call;
  }
}
