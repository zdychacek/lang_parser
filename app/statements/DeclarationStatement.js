import Statement from './Statement';
import IdentifierExpression from '../expressions/IdentifierExpression';
import { TokenType, Punctuator } from '../Lexer';

class DeclarationStatement extends Statement {
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
    id = IdentifierExpression.parse(parser, id);

    return {
      type: 'VariableDeclarator',
      id,
      init
    };
  }
}

export default DeclarationStatement;
