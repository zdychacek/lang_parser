import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { Precedence, TokenType, Punctuator } from '../../Lexer';
import DeclarationStatement from '../DeclarationStatement';

export default class DeclarationStatementParser extends StatementParser {
  parse (parser, token) {
    var declarationStmt = new DeclarationStatement([], token.value);

    do {
      let idToken = parser.consumeType(TokenType.Identifier);
      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression();
      }

      // defined variable in current scope
      parser.scope.define(idToken.value);

      declarationStmt.addDeclarator(IdentifierExpressionParser.parse(parser, idToken), init);
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    parser.consume(Punctuator.Semicolon);

    return declarationStmt;
  }
}
