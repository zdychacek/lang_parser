import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import { TokenType, Keyword, Punctuator } from '../../Lexer';
import FunctionExpression from '../FunctionExpression';

export default class FunctionExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var id = null;
    var params = [];
    var body = null;

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      id = IdentifierExpressionParser.parse(parser, parser.consume(), true);
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
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);

    // create new function scope, if function id was specified, then inject that id in the function scope
    var fnNameVar = id? { [id.name] : Keyword.Var } : null;
    parser.pushScope(false, fnNameVar);

    body = parser.parseBlock();

    parser.popScope();
    parser.state.popAttribute('inFunction');

    return new FunctionExpression(id, params, body);
  }
}
