import StatementParser from './StatementParser';
import { Punctuator, TokenType } from '../../Lexer';
import ContinueStatement from '../ContinueStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class ContinueStatementParser extends StatementParser {
  parse (parser, token) {
    var label = null;

    if (!parser.state.getAttribute('inLoop')) {
      throw new SyntaxError('Illegal continue statement.');
    }

    if (!parser.match(Punctuator.Semicolon)) {
      let labelToken = parser.consume();

      if (labelToken.type != TokenType.Identifier) {
        throw new SyntaxError('Unexpected continue label.');
      }

      label = IdentifierExpressionParser.parse(parser, labelToken, true);

      if (!parser.scope.hasLabel(label.name)) {
        throw new SyntaxError(`Undefined label ${label.name}.`);
      }
    }

    parser.consume(Punctuator.Semicolon);

    return new ContinueStatement(label);
  }
}
