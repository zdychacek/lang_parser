import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { Precedence, TokenType, Punctuator, Keyword } from '../../Lexer';
import DeclarationStatement from '../DeclarationStatement';

export default class DeclarationStatementParser extends StatementParser {
  parse (parser, token, params) {
    var kind = token.value;
    var declarationStmt = new DeclarationStatement([], kind);

    params || (params = {});

    do {
      let idToken = parser.consumeType(TokenType.Identifier);

      // define variable in current scope
      parser.scope.define(idToken.value, kind == Keyword.Var);

      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression(Precedence.Sequence);
      }

      declarationStmt.addDeclarator(IdentifierExpressionParser.parse(parser, idToken), init);
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    if (params.consumeSemicolon !== false) {
      parser.consume(Punctuator.Semicolon);
    }

    return declarationStmt;
  }
}
