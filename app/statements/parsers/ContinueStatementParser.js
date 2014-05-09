import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import ContinueStatement from '../ContinueStatement';
import IdentifierExpression from '../../expressions/IdentifierExpression';

export default class ContinueStatementParser extends StatementParser {
  parse (parser, token) {
    var label = null;

    if (!parser.state.inLoop) {
      throw new SyntaxError('Illegal continue statement.');
    }

    if (!parser.match(Punctuator.Semicolon)) {
      label = parser.parseExpression();

      if (!(label instanceof IdentifierExpression)) {
        throw new SyntaxError('Unexpected continue label.');
      }

      if (!parser.scope.hasLabel(label.name)) {
        throw new SyntaxError(`Undefined label ${label.name}.`);
      }
    }

    parser.consume(Punctuator.Semicolon);

    return new ContinueStatement(label);
  }
}
