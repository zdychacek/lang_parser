import StatementParser from './StatementParser';
import { Punctuator, Keyword } from '../../Lexer';
import IfStatement from '../IfStatement';

export default class IfStatementParser extends StatementParser {
  parse (parser) {
    var consequent = null;
    var alternate = null;

    // parse condition
    parser.consume(Punctuator.LeftParen);
    var test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    // create new block scope
    parser.pushScope(true);
    consequent = parser.parseExpressionStatementOrBlock();
    parser.popScope();

    // try to parse else clause
    if (parser.match(Keyword.Else)) {
      parser.consume(Keyword.Else);

      // try to parse else if clause
      if (parser.match(Keyword.If)) {
        alternate = parser.parseStatement(false);
      }
      else {
        // create new block scope
        parser.pushScope(true);
        alternate = parser.parseExpressionStatementOrBlock();
        parser.popScope();
      }
    }

    return new IfStatement(test, consequent, alternate);
  }
}
