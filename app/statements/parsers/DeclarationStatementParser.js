import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { Precedence, TokenType, Punctuator } from '../../Lexer';
import DeclarationStatement from '../DeclarationStatement';

export default class DeclarationStatementParser extends StatementParser {
  parse (parser, token) {
    var kind = token.value;
    var declarationStmt = new DeclarationStatement([], kind);

    do {
      let idToken = parser.consumeType(TokenType.Identifier);

      // define variable in current scope
      parser.scope.define(idToken.value, kind == 'var');
      
      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression(Precedence.Sequence);
      }

      declarationStmt.addDeclarator(IdentifierExpressionParser.parse(parser, idToken), init);
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    parser.consume(Punctuator.Semicolon);

    return declarationStmt;
  }
}
