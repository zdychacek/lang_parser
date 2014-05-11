import {
  TokenType,
  Keyword,
  Punctuator
} from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import FunctionExpression from '../FunctionExpression';

export default class FunctionExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var id = null;
    var params = [];
    var body = null;
    var scopeVars = {};

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
          parser.throw('Unexpected token ILLEGAL.');
        }

        scopeVars[paramToken.value] = Keyword.Var;
        params.push(IdentifierExpressionParser.parse(parser, paramToken, true));
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightParen);

    // if function id was specified, then inject that id in the function scope
    if (id) {
      scopeVars[id.name] = Keyword.Var;
    }

    // parse function body
    parser.state.pushAttribute('inFunction', true);

    // create new function scope
    parser.pushScope(false, scopeVars);

    body = parser.parseBlock();

    parser.popScope();
    parser.state.popAttribute('inFunction');

    return new FunctionExpression(id, params, body);
  }
}
