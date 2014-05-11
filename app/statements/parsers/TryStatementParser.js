import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import TryStatement from '../TryStatement';

export default class TryStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Try);

    console.log('try parser');

    return new TryStatement();
  }
}
