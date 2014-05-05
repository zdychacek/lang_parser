import Statement from './Statement';
import { Punctuator } from '../Lexer';

class LeftCurlyStatement extends Statement {
  parse (parser) {
    var statements = parser.parseStatements();

    parser.consume(Punctuator.RightCurly);

    return statements;
  }
}

export default LeftCurlyStatement;
