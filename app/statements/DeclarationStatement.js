import Statement from './Statement';
import IdentifierExpression from '../expressions/IdentifierExpression';
import { TokenType, Keyword } from '../Lexer';

class DeclarationStatement extends Statement {
  parse (parser, statementToken) {
    var declarations = [];
    var kind = statementToken.value;

    while (true) {
      let id = parser.consume(TokenType.IDENTIFIER);
      let init = null;

      if (parser.match(TokenType.ASSIGN)) {
        parser.consume(TokenType.ASSIGN);

        init = parser.parseExpression();
      }

      declarations.push(this._makeDeclarator(parser, id, init));

      if (!parser.match(TokenType.COMMA)) {
        break;
      }

      parser.consume(TokenType.COMMA);
    }

    parser.consume(TokenType.SEMICOLON);

    return {
      type: 'VariableDeclaration',
      declarations,
      kind
    };
  }

  _makeDeclarator (parser, id, init) {
    id = IdentifierExpression.parse(parser, id);

    return {
      type: 'VariableDeclarator',
      id,
      init
    };
  }
}

export default DeclarationStatement;
