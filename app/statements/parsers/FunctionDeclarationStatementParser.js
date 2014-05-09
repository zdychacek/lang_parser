import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { TokenType, Punctuator } from '../../Lexer';
import FunctionDeclarationStatement from '../FunctionDeclarationStatement';

export default class FunctionDeclarationStatementParser extends StatementParser {
  parse (parser, token) {
    var tokenId = parser.consumeType(TokenType.Identifier);

    // defined variable in current scope
    parser.scope.define(tokenId.value);

    var params = [];
    var body = null;
    var id = IdentifierExpressionParser.parse(parser, tokenId);

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
    var currInFunctionState = parser.state.inFunction;
    parser.state.inFunction = true;
    // create new scope
    parser.pushScope();

    body = parser.parseBlock();

    parser.popScope();
    parser.state.inFunction = currInFunctionState;

    return new FunctionDeclarationStatement(id, params, body);
  }
}
