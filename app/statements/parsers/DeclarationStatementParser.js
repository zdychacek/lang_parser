import {
  Precedence,
  TokenType,
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { DeclarationStatement } from '../DeclarationStatement';

export default class DeclarationStatementParser extends StatementParser {
  parse (parser, params) {
    var kind;

    if (parser.match(Keyword.Var) || parser.match(Keyword.Let)) {
      kind = parser.consume().value;
    }
    else {
      parser.throw('Unexpected declaration statement');
    }

    var declarationStmt = new DeclarationStatement([], kind);

    params || (params = {});

    var withoutDefinition = params.withoutDefinition;

    do {
      let idToken = parser.consumeType(TokenType.Identifier);

      // define variable in current scope
      if (!withoutDefinition) {
        parser.scope.define(idToken.value, kind);
      }

      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression(Precedence.Sequence);
      }

      declarationStmt.addDeclarator(IdentifierExpressionParser.parse(parser, idToken, true), init);
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    if (params.consumeSemicolon !== false) {
      parser.consume(Punctuator.Semicolon);
    }

    return declarationStmt;
  }
}
