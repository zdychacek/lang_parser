import {
  Punctuator,
  TokenType,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import ContinueStatement from '../ContinueStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class ContinueStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Continue);

    var inLoop = parser.state.getAttribute('inLoop');

    if (parser.matchAndConsume(Punctuator.Semicolon)) {
      if (!inLoop) {
        parser.throw('Illegal continue statement');
      }

      return new ContinueStatement(null);
    }

    if (parser.peekLineTerminator()) {
      if (!inLoop) {
        parser.throw('Illegal continue statement');
      }

      return new ContinueStatement(null);
    }

    var label = null;

    if (parser.matchType(TokenType.Identifier)) {
      label = IdentifierExpressionParser.parse(parser, true);

      if (!parser.scope.hasLabel(label.name)) {
        parser.throw(`Undefined label ${label.name}`, ReferenceError);
      }
    }

    if (!inLoop) {
      parser.throw('Illegal continue statement');
    }

    parser.consumeSemicolon();

    return new ContinueStatement(label);
  }
}
