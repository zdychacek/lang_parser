import Statement from './Statement';
import { Punctuator } from '../Lexer';

class ReturnStatement extends Statement {
  parse (parser) {
    var argument = null;

    if (!parser.matchAndConsume(Punctuator.Semicolon)) {
      argument = parser.parseExpression();
      parser.consume(Punctuator.Semicolon);
    }

    if (!parser.match(Punctuator.RightCurly)) {
      throw new SyntaxError('Unreachable statement.');
    }

    return {
      type: 'ReturnStatement',
      argument
    }
  }
}

export default ReturnStatement;
