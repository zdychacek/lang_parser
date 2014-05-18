import { Punctuator } from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import BlockStatement from '../BlockStatement';

export default class BlockStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Punctuator.OpenCurly);

    // create block scope
    //parser.pushScope(ScopeType.Block);
    var statements = parser.parseStatements();
    //parser.popScope();

    parser.consume(Punctuator.CloseCurly);

    return new BlockStatement(statements);
  }
}
