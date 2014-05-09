import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import BlockStatement from '../BlockStatement';

export default class BlockStatementParser extends StatementParser {
  parse (parser) {
    parser.pushScope(true);
    var statements = parser.parseStatements();
    parser.popScope();

    parser.consume(Punctuator.RightCurly);

    return new BlockStatement(statements);
  }
}
