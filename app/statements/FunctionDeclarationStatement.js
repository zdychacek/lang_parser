import Statement from './Statement';
import IdentifierExpression from '../expressions/IdentifierExpression';
import { TokenType, Keyword } from '../Lexer';

class FunctionDeclarationStatement extends Statement {
  parse (parser, token) {
    var id = parser.consume(TokenType.IDENTIFIER);
    var params = [];
    var body;

    id = IdentifierExpression.parse(parser, id);

    parser.consume(TokenType.LEFT_PAREN);

    if (!parser.match(TokenType.RIGHT_PAREN)) {
      while (true) {
        let param = parser.consume();

        if (param.type != TokenType.IDENTIFIER) {
          throw new SyntaxError('Unexpected token ILLEGAL.');
        }

        params.push(IdentifierExpression.parse(parser, param));

        if (!parser.match(TokenType.COMMA)) {
          break;
        }

        parser.consume(TokenType.COMMA);
      }
    }

    parser.consume(TokenType.RIGHT_PAREN);

    body = parser.parseBlock();

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body
    };
  }
}

export default FunctionDeclarationStatement;
