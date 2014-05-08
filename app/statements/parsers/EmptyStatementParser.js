import StatementParser from './StatementParser';
import EmptyStatement from '../EmptyStatement';

export default class EmptyStatementParser extends StatementParser {
  parse (parser) {
    return new EmptyStatement();
  }
}
