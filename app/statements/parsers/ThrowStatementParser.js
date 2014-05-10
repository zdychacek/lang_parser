import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import ThrowStatement from '../ThrowStatement';

export default class ThrowStatementParser extends StatementParser {
  parse (parser, token) {
    var argument = null;

    if (!parser.match(Punctuator.Semicolon)) {
      argument = parser.parseExpression();
      parser.consume(Punctuator.Semicolon);
    }

    return new ThrowStatement(argument);
  }
}
