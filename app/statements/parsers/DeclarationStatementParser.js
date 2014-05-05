import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import { TokenType, Punctuator } from '../../Lexer';

class DeclarationStatementParser extends StatementParser {
  parse (parser, statementToken) {
    var declarations = [];
    var kind = statementToken.value;

    while (true) {
      let id = parser.consumeType(TokenType.Identifier);
      let init = null;

      if (parser.matchAndConsume(Punctuator.Assign)) {
        init = parser.parseExpression();
      }

      declarations.push(this._makeDeclarator(parser, id, init));

      if (!parser.match(Punctuator.Comma)) {
        break;
      }

      parser.consume(Punctuator.Comma);
    }

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

export default DeclarationStatementParser;
