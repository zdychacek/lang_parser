import Statement from './Statement';
import { TokenType, Keyword } from '../Lexer';

class IfStatement extends Statement {
  parse (parser) {
    var statement = {
      type: 'If'
    };

    parser.consume(TokenType.LEFT_PAREN);
    statement.testExpression = parser.parseExpression();
    parser.consume(TokenType.RIGHT_PAREN);
    statement.thenArm = parser.parseBlock();

    if (parser.match(Keyword.ELSE)) {
      parser.consume(Keyword.ELSE);

      if (parser.match(Keyword.IF)) {
        statement.elseArm = parser.parseStatement();
      }
      else {
        statement.elseArm = parser.parseBlock();
      }
    }
    else {
      statement.elseArm = null;
    }

    return statement;
  }
}

export default IfStatement;
