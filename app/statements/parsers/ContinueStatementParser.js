import StatementParser from './StatementParser';
import { Punctuator, TokenType, Keyword } from '../../Lexer';
import ContinueStatement from '../ContinueStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class ContinueStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Continue);

    var label = null;

    if (!parser.state.getAttribute('inLoop')) {
      parser.throw('Illegal continue statement');
    }

    if (!parser.match(Punctuator.Semicolon)) {
      let labelToken = parser.consume();

      if (labelToken.type != TokenType.Identifier) {
        parser.throw('Unexpected continue label');
      }

      label = IdentifierExpressionParser.parse(parser, labelToken, true);

      if (!parser.scope.hasLabel(label.name)) {
        parser.throw(`Undefined label ${label.name}`, ReferenceError);
      }
    }

    parser.consume(Punctuator.Semicolon);

    return new ContinueStatement(label);
  }
}
