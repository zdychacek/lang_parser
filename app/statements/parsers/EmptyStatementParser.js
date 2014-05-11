import { Punctuator } from '../../Lexer';
import StatementParser from './StatementParser';
import EmptyStatement from '../EmptyStatement';

export default class EmptyStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Punctuator.Semicolon);

    return new EmptyStatement();
  }
}
