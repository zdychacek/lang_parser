import StatementParser from './StatementParser';
import BlockStatement from '../BlockStatement';
import { Punctuator } from '../../Lexer';

export default class LeftCurlyStatementParser extends StatementParser {
  parse (parser) {
    var statements = parser.parseStatements();

    parser.consume(Punctuator.RightCurly);

    return new BlockStatement(statements);
  }
}
