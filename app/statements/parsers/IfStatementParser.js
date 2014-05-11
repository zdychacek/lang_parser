import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import IfStatement from '../IfStatement';

export default class IfStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.If);

    var consequent = null;
    var alternate = null;

    // parse condition
    parser.consume(Punctuator.LeftParen);
    var test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    consequent = parser.parseBlockOrExpression();

    // try to parse else clause
    if (parser.match(Keyword.Else)) {
      parser.consume(Keyword.Else);

      // try to parse else if clause
      if (parser.match(Keyword.If)) {
        alternate = parser.parseStatement();
      }
      else {
        alternate = parser.parseBlockOrExpression();
      }
    }

    return new IfStatement(test, consequent, alternate);
  }
}
