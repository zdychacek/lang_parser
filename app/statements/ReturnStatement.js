import Statement from './Statement';
import { TokenType } from '../Lexer';

class ReturnStatement extends Statement {
  parse (parser) {
    var argument = null;

    if (!parser.matchAndConsume(TokenType.SEMICOLON)) {
      argument = parser.parseExpression();
      parser.consume(TokenType.SEMICOLON);
    }

    if (!parser.match(TokenType.RIGHT_CURLY)) {
      throw new SyntaxError('Unreachable statement.');
    }

    return {
      type: 'ReturnStatement',
      argument
    }
  }
}

export default ReturnStatement;
