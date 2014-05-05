import Statement from './Statement';
import { TokenType, Punctuator, Keyword } from '../Lexer';

class IfStatement extends Statement {
  parse (parser) {
    var test, consequent, alternate = null;

    parser.consume(Punctuator.LeftParen);
    test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    consequent = this._parseArm(parser);

    if (parser.match(Keyword.Else)) {
      parser.consume(Keyword.Else);

      if (parser.match(Keyword.If)) {
        alternate = parser.parseStatement();
      }
      else {
        alternate = this._parseArm(parser);
      }
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    };
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

export default IfStatement;
