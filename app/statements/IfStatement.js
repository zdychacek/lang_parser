import Statement from './Statement';
import { TokenType, Keyword } from '../Lexer';

class IfStatement extends Statement {
  parse (parser) {
    var ret = {
      type: 'If'
    };

    parser.consume(TokenType.LEFT_PAREN);
    ret.testExpression = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);
    ret.thenArm = parser.parseBlock();

    if (parser.match(Keyword.ELSE)) {
      parser.consume(Keyword.ELSE);
      ret.elseArm = parser.match(Keyword.IF)? parser.parseStatement() : parser.parseBlock();
    }
    else {
      ret.elseArm = null;
    }

    return ret;
  }
}

export default IfStatement;
