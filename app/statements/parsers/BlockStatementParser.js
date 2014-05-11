import { Punctuator } from '../../Lexer';
import StatementParser from './StatementParser';
import BlockStatement from '../BlockStatement';

export default class BlockStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Punctuator.LeftCurly);

    // create block scope
    parser.pushScope(true);
    var statements = parser.parseStatements();
    parser.popScope();

    parser.consume(Punctuator.RightCurly);

    return new BlockStatement(statements);
  }
}
