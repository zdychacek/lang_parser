import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { TokenType, Punctuator } from '../../Lexer';

export default class FunctionDeclarationStatementParser extends StatementParser {
  parse (parser, token, state) {
    var tokenId = parser.consumeType(TokenType.Identifier);
    var params = [];
    var body = null;
    var id = IdentifierExpressionParser.parse(parser, tokenId);

    parser.consume(Punctuator.LeftParen);

    if (!parser.match(Punctuator.RightParen)) {
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

    // optional semicolon after function declaration
    if (parser.match(Punctuator.Semicolon)) {
      parser.consume(Punctuator.Semicolon);
    }

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body
    };
  }
}
