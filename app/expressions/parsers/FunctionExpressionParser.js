import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import { TokenType, Keyword, Punctuator } from '../../Lexer';

export default class FunctionExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var id = null;
    var params = [];
    var body;

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      let idToken = parser.consumeType(TokenType.Identifier);
      id = IdentifierExpressionParser.parse(parser, idToken);
    }

    parser.consume(Punctuator.LeftParen);

    if (!parser.match(Punctuator.RightParen)) {
      // parse parameters
      while (true) {
        let paramToken = parser.consume();

        if (!parser.matchType(TokenType.Identifier, paramToken)) {
          throw new SyntaxError('Unexpected token ILLEGAL.');
        }

        params.push(IdentifierExpressionParser.parse(parser, paramToken));

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
