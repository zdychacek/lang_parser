import {
  TokenType,
  Punctuator,
  Keyword
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import FunctionDeclarationStatement from '../FunctionDeclarationStatement';

export default class FunctionDeclarationStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Function);

    var tokenId = parser.consumeType(TokenType.Identifier);
    var scopeVars = {};

    // defined variable in current scope
    parser.scope.define(tokenId.value, Keyword.Var);

    var params = [];
    var body = null;
    var id = IdentifierExpressionParser.parse(parser, tokenId);

    parser.consume(Punctuator.OpenParen);

    if (!parser.match(Punctuator.CloseParen)) {
      // parse parameters
      do {
        let paramToken = parser.consume();

        if (!parser.matchType(TokenType.Identifier, paramToken)) {
          parser.throw('Unexpected token ILLEGAL');
        }

        scopeVars[paramToken.value] = Keyword.Var;
        params.push(IdentifierExpressionParser.parse(parser, paramToken, true));
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);

    body = parser.parseBlock(ScopeType.Function, scopeVars);

    parser.state.popAttribute('inFunction');

    return new FunctionDeclarationStatement(id, params, body);
  }
}
