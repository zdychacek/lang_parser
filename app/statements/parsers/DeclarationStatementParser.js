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
  parse (parser, params = {}) {
    var kind;
    params || (params = {});

    if (parser.match(Keyword.Var) || parser.match(Keyword.Let)) {
      kind = parser.consume().value;
    }
    else {
      parser.throw('Unexpected declaration statement');
    }

    var declarationStmt = new DeclarationStatement(kind);

    do {
      let id = parser.peek();
      let init = null;

      if (id.type != TokenType.Identifier) {
        parser.throw(`Unexpected token ${id.value}`);
      }

      id = IdentifierExpressionParser.parse(parser);

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression(Precedence.Sequence);
      }

      declarationStmt.addDeclarator(id, init);
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    if (params.consumeSemicolon !== false) {
      parser.consumeSemicolon();
    }

    return declarationStmt;
  }
}
