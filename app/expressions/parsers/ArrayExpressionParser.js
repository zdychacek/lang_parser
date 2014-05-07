import PrefixExpressionParser from './PrefixExpressionParser';
import { Punctuator } from '../../Lexer';

export default class ArrayExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var elements = [];

    if (!parser.match(Punctuator.RightSquare)) {
      do {
        elements.push(parser.parseExpression());
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightSquare);

    return {
      type: 'ArrayExpression',
      elements
    };
  }
}
