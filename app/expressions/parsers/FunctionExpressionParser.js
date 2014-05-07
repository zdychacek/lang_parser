import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import { TokenType, Keyword, Punctuator } from '../../Lexer';
import FunctionExpression from '../FunctionExpression';

export default class FunctionExpressionParser extends PrefixExpressionParser {
  parse (parser, token, state) {
    var id = null;
    var params = [];
    var body = null;

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      id = IdentifierExpressionParser.parse(parser, parser.consume());
    }

    parser.consume(Punctuator.LeftParen);

    if (!parser.match(Punctuator.RightParen)) {
      // parse parameters
      do {
        let paramToken = parser.consume();

        if (!parser.matchType(TokenType.Identifier, paramToken)) {
          throw new SyntaxError('Unexpected token ILLEGAL.');
        }

        params.push(IdentifierExpressionParser.parse(parser, paramToken));

        if (!parser.match(Punctuator.Comma)) {
          break;
        }
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightParen);

    // parse function body
    state.inFunction = true;
    body = parser.parseBlock();
    state.inFunction = false;

    return new FunctionExpression(id, params, body);
  }
}
