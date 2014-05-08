import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import BreakStatement from '../BreakStatement';
import IdentifierExpression from '../../expressions/IdentifierExpression';

export default class BreakStatementParser extends StatementParser {
  parse (parser, token) {
    var label = null;

    if (!parser.state.inLoop) {
      throw new SyntaxError('Illegal break statement.');
    }

    if (!parser.matchAndConsume(Punctuator.Semicolon)) {
      label = parser.parseExpression();

      if (!(label instanceof IdentifierExpression)) {
        throw new SyntaxError('Unexpected break label.');
      }

      if (!parser.scope.hasLabel(label.name)) {
        throw new SyntaxError(`Undefined label ${label.name}.`);
      }
    }

    return new BreakStatement(label);
  }
}
