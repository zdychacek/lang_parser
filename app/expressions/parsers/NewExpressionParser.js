import PrefixExpressionParser from './PrefixExpressionParser';
import { Punctuator, Precedence } from '../../Lexer';
import NewExpression from '../NewExpression';

export default class NewExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var callee = parser.parseExpression(Precedence.Call);
    var args = [];

    // try to parse optional parameters
    if (parser.matchAndConsume(Punctuator.LeftParen)) {
      if (!parser.match(Punctuator.RightParen)) {
        do {
          args.push(parser.parseExpression(Precedence.Sequence));
        }
        while (parser.matchAndConsume(Punctuator.Comma));
      }

      parser.consume(Punctuator.RightParen);
    }

    return new NewExpression(callee, args);
  }

  get precedence () {
    return Precedence.Call;
  }
}
