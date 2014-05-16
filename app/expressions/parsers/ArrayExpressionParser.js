import {
  Punctuator,
  Precedence
} from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import ArrayExpression from '../ArrayExpression';

export default class ArrayExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var elements = [];

    parser.consume(Punctuator.OpenSquare);

    if (!parser.match(Punctuator.CloseSquare)) {
      do {
        elements.push(parser.parseExpression(Precedence.Sequence));
      }
      // no support for trailing comma
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseSquare);

    return new ArrayExpression(elements);
  }
}
