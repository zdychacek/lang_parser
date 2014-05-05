import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';

class ReturnStatementParser extends StatementParser {
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

export default ReturnStatementParser;
