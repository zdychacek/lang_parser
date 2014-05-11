import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import SwitchStatement from '../SwitchStatement';

export default class SwitchStatementParser extends StatementParser {
  parse (parser, token) {
    parser.consume(Keyword.Switch);

    parser.consume(Punctuator.OpenParen);
    var discriminant = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    var switchStmt = new SwitchStatement(discriminant);

    parser.consume(Punctuator.OpenCurly);

    var containsDefaultClause = false;

    if (!parser.match(Punctuator.CloseCurly)) {
      // create block scope
      parser.pushScope(true);

      do {
        let token = parser.consume();

        if (token.value != Keyword.Case && token.value != Keyword.Default) {
          parser.throw(`Unexpected token ${token.value}`);
        }

        let testExpr = null;

        // case clause
        if (token.value == Keyword.Case) {
          testExpr = parser.parseExpression();
        }
        // default clause
        else {
          if (containsDefaultClause) {
            parser.throw('Switch statement has already default clause defined');
          }
          containsDefaultClause = true;
        }

        parser.consume(Punctuator.Colon);

        parser.state.pushAttribute('inSwitchCaseBody', true);

        // parse case/default statements
        let consequentStmts = parser.parseStatements();

        parser.state.popAttribute('inSwitchCaseBody');

        switchStmt.addCase(testExpr, consequentStmts);
      }
      while (!parser.match(Punctuator.CloseCurly));

      parser.popScope();
    }

    parser.consume(Punctuator.CloseCurly);

    return switchStmt;
  }
}
