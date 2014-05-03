import Statement from './Statement';
import { TokenType, Keyword } from '../Lexer';

class IfStatement extends Statement {
  parse (parser) {
    var testExpression, thenArm, elseArm = null;

    parser.consume(TokenType.LEFT_PAREN);
    testExpression = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);

    thenArm = this._parseArm(parser);

    if (parser.match(Keyword.ELSE)) {
      parser.consume(Keyword.ELSE);

      if (parser.match(Keyword.IF)) {
        elseArm = parser.parseStatement();
      }
      else {
        elseArm = this._parseArm(parser);
      }
    }

    return {
      type: 'If',
      testExpression,
      thenArm,
      elseArm
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
