import Statement from './Statement';
import IdentifierExpression from '../expressions/IdentifierExpression';
import { TokenType, Keyword } from '../Lexer';

class FunctionDeclarationStatement extends Statement {
  parse (parser, token) {
    //
    var tokenId = parser.consume(TokenType.IDENTIFIER);
    var params = [];
    var body;

    var id = IdentifierExpression.parse(parser, tokenId);

    parser.consume(TokenType.LEFT_PAREN);

    if (!parser.match(TokenType.RIGHT_PAREN)) {
      while (true) {
        let paramToken = parser.consume();

        if (paramToken.type != TokenType.IDENTIFIER) {
          throw new SyntaxError('Unexpected token ILLEGAL.');
        }

        params.push(IdentifierExpression.parse(parser, paramToken));

        if (!parser.match(TokenType.COMMA)) {
          break;
        }

        parser.consume(TokenType.COMMA);
      }
    }

    parser.consume(TokenType.RIGHT_PAREN);

    body = parser.parseBlock();

    // optional semicolon after function declaration
    if (parser.match(TokenType.SEMICOLON)) {
      parser.consume(TokenType.SEMICOLON);
    }

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body
    };
  }
}

export default FunctionDeclarationStatement;
