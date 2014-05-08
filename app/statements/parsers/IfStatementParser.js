import StatementParser from './StatementParser';
import { Punctuator, Keyword } from '../../Lexer';
import IfStatement from '../IfStatement';

export default class IfStatementParser extends StatementParser {
  parse (parser) {
    var consequent = null;
    var alternate = null;

    parser.consume(Punctuator.LeftParen);
    // parse condition
    var test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    consequent = this._parseArm(parser);

    // try to parse else clause
    if (parser.match(Keyword.Else)) {
      parser.consume(Keyword.Else);

      // try to parse else if clause
      if (parser.match(Keyword.If)) {
        alternate = parser.parseStatement(false);
      }
      else {
        alternate = this._parseArm(parser);
      }
    }

    return new IfStatement(test, consequent, alternate);
  }

  _parseArm (parser) {
    if (parser.match(Punctuator.LeftCurly)) {
      return parser.parseBlock();
    }
    else {
      return parser.parseStatement();
    }
  }
}
