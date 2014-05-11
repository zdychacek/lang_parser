import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import ThrowStatement from '../ThrowStatement';

export default class ThrowStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Throw);

    var argument = null;

    if (!parser.match(Punctuator.Semicolon)) {
      argument = parser.parseExpression();
      parser.consume(Punctuator.Semicolon);
    }

    return new ThrowStatement(argument);
  }
}
