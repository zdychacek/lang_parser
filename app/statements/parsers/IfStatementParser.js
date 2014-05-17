import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import IfStatement from '../IfStatement';

export default class IfStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.If);

    var ifStmt = new IfStatement();

    // parse condition
    parser.consume(Punctuator.OpenParen);
    ifStmt.test = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    ifStmt.consequent = parser.parseBlockOrExpression();

    // try to parse else clause
    if (parser.match(Keyword.Else)) {
      parser.consume(Keyword.Else);

      // try to parse else if clause
      if (parser.match(Keyword.If)) {
        ifStmt.alternate = parser.parseStatement();
      }
      else {
        ifStmt.alternate = parser.parseBlockOrExpression();
      }
    }

    return ifStmt;
  }
}
