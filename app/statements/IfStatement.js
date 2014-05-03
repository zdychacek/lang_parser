import Statement from './Statement';
import { TokenType, Keyword } from '../Lexer';

class IfStatement extends Statement {
  parse (parser) {
    var test, consequent, alternate = null;

    parser.consume(TokenType.LEFT_PAREN);
    test = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);

    consequent = this._parseArm(parser);

    if (parser.match(Keyword.ELSE)) {
      parser.consume(Keyword.ELSE);

      if (parser.match(Keyword.IF)) {
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
    if (parser.match(TokenType.LEFT_CURLY)) {
      return parser.parseBlock();
    }
    else {
      return parser.parseStatement();
    }
  }
}

export default IfStatement;
