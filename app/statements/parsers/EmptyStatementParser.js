import StatementParser from './StatementParser';
import EmptyStatement from '../EmptyStatement';
import { Punctuator } from '../../Lexer';

export default class EmptyStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Punctuator.Semicolon);

    return new EmptyStatement();
  }
}
