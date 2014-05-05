import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';

class LeftCurlyStatementParser extends StatementParser {
  parse (parser) {
    var statements = parser.parseStatements();

    parser.consume(Punctuator.RightCurly);

    return statements;
  }
}

export default LeftCurlyStatementParser;
