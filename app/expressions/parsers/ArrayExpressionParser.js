import PrefixExpressionParser from './PrefixExpressionParser';
import { Punctuator } from '../../Lexer';
import ArrayExpression from '../ArrayExpression';

export default class ArrayExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var elements = [];

    if (!parser.match(Punctuator.RightSquare)) {
      do {
        elements.push(parser.parseExpression());
      }
      // no support for trailing comma
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightSquare);

    return new ArrayExpression(elements);
  }
}
