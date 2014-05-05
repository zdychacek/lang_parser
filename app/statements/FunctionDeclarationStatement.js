import Statement from './Statement';
import IdentifierExpression from '../expressions/IdentifierExpression';
import { TokenType, Punctuator } from '../Lexer';

class FunctionDeclarationStatement extends Statement {
  parse (parser, token) {
    //
    var tokenId = parser.consumeType(TokenType.Identifier);
    var params = [];
    var body;

    var id = IdentifierExpression.parse(parser, tokenId);

    parser.consume(Punctuator.LeftParen);

    if (!parser.match(Punctuator.RightParen)) {
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

    body = parser.parseBlock();

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

export default FunctionDeclarationStatement;
