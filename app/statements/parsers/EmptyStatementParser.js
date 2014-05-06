import StatementParser from './StatementParser';

export default class EmptyStatementParser extends StatementParser {
  parse (parser) {
    return {
      type: 'EmptyStatement'
    };
  }
}
