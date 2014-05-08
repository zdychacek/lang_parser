import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { TokenType, Punctuator } from '../../Lexer';

export default class DeclarationStatementParser extends StatementParser {
  parse (parser, statementToken) {
    var declarations = [];
    var kind = statementToken.value;

    do {
      let id = parser.consumeType(TokenType.Identifier);
      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression();
      }

      // defined variable in current scope
      parser.scope.define(id.value);

      declarations.push(this._makeDeclarator(parser, id, init));
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    parser.consume(Punctuator.Semicolon);

    return {
      type: 'VariableDeclaration',
      declarations,
      kind
    };
  }

  _makeDeclarator (parser, id, init) {
    id = IdentifierExpressionParser.parse(parser, id);

    return {
      type: 'VariableDeclarator',
      id,
      init
    };
  }
}
