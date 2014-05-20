import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import WithStatement from '../WithStatement';

export default class WithStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.With);

    var withStmt = new WithStatement();

    parser.consume(Punctuator.OpenParen);
    withStmt.object = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    withStmt.body = parser.parseBlockOrExpression();

    return withStmt;
  }
}
