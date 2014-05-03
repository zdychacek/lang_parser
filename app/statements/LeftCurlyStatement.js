import Statement from './Statement';
import { TokenType } from '../Lexer';

class LeftCurlyStatement extends Statement {
  parse (parser) {
    var statements = parser.parseStatements();

    parser.consume(TokenType.RIGHT_CURLY);

    return statements;
  }
}

export default LeftCurlyStatement;
