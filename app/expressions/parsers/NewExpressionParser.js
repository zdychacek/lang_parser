import {
  Punctuator,
  Precedence
} from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import NewExpression from '../NewExpression';

export default class NewExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var callee = parser.parseExpression(Precedence.Call);
    var args = [];

    // try to parse optional parameters
    if (parser.matchAndConsume(Punctuator.OpenParen)) {
      if (!parser.match(Punctuator.CloseParen)) {
        do {
          args.push(parser.parseExpression(Precedence.Sequence));
        }
        while (parser.matchAndConsume(Punctuator.Comma));
      }

      parser.consume(Punctuator.CloseParen);
    }

    return new NewExpression(callee, args);
  }

  get precedence () {
    return Precedence.Call;
  }
}
