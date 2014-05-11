import { Keyword, Punctuator } from '../../Lexer';
import StatementParser from './StatementParser';
import DebuggerStatement from '../DebuggerStatement';

export default class DebuggerStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Debugger);
    parser.consume(Punctuator.Semicolon);

    return new DebuggerStatement();
  }
}
