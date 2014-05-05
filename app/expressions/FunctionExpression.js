import PrefixExpression from './PrefixExpression';
import IdentifierExpression from './IdentifierExpression';
import { TokenType, Keyword, Punctuator } from '../Lexer';

class FunctionExpression extends PrefixExpression {
  parse (parser, token) {
    var id = null;
    var params = [];
    var body;

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      let idToken = parser.consumeType(TokenType.Identifier);
      id = IdentifierExpression.parse(parser, idToken);
    }

    parser.consume(Punctuator.LeftParen);

    if (!parser.match(Punctuator.RightParen)) {
      // parse parameters
      while (true) {
        let paramToken = parser.consume();

        if (!parser.matchType(TokenType.Identifier, paramToken)) {
          throw new SyntaxError('Unexpected token ILLEGAL.');
        }

        params.push(IdentifierExpression.parse(parser, paramToken));

        if (!parser.match(Punctuator.Comma)) {
          break;
        }

        parser.consume(Punctuator.Comma);
      }
    }

    parser.consume(Punctuator.RightParen);

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
