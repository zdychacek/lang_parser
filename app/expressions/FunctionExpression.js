import PrefixExpression from './PrefixExpression';
import IdentifierExpression from './IdentifierExpression';
import { TokenType, Keyword } from '../Lexer';

class FunctionExpression extends PrefixExpression {
  parse (parser, token) {
    var id = null;
    var params = [];
    var body;

    // parse optional name
    if (parser.match(TokenType.IDENTIFIER)) {
      let idToken = parser.consume(TokenType.IDENTIFIER);

      id = IdentifierExpression.parse(parser, idToken);
    }

    parser.consume(TokenType.LEFT_PAREN);

    if (!parser.match(TokenType.RIGHT_PAREN)) {
      // parse parameters
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

    // parse function body
    body = parser.parseBlock();

    return {
      type: 'FunctionExpression',
      id,
      params,
      body
    };
  }
}

export default FunctionExpression;
