import StatementParser from './StatementParser';
import SwitchStatement from '../SwitchStatement';
import { Punctuator, Keyword } from '../../Lexer';

export default class SwitchStatementParser extends StatementParser {
  parse (parser, token) {
    parser.consume(Punctuator.LeftParen);
    var discriminant = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    var switchStmt = new SwitchStatement(discriminant);

    parser.consume(Punctuator.LeftCurly);

    var containsDefaultClause = false;

    if (!parser.match(Punctuator.RightCurly)) {
      // create block scope
      parser.pushScope(true);

      do {
        let token = parser.consume();

        if (token.value != Keyword.Case && token.value != Keyword.Default) {
          throw new SyntaxError('Unexpected token.');
        }
        
        let testExpr = null;

        // case clause
        if (token.value == Keyword.Case) {
          testExpr = parser.parseExpression();  
        }
        // default clause
        else {
          if (containsDefaultClause) {
            throw new SyntaxError('Switch statement has already default clause defined.');
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
      while (!parser.match(Punctuator.RightCurly));

      parser.popScope();
    }

    parser.consume(Punctuator.RightCurly);

    return switchStmt;
  }
}
