import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import ThrowStatement from '../ThrowStatement';

export default class ThrowStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Throw);

    var throwStmt = new ThrowStatement();;

    if (parser.peekLineTerminator()) {
      parser.throw('Illegal new line after throw statement');
    }

    throwStmt.argument = parser.parseExpression();

    parser.consumeSemicolon();

    return throwStmt;
  }
}
