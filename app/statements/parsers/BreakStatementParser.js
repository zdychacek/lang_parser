import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import BreakStatement from '../BreakStatement';
import IdentifierExpression from '../../expressions/IdentifierExpression';

export default class BreakStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Break);

    var label = null;
    var inLoop = parser.state.getAttribute('inLoop');
    var inSwitchCaseBody = parser.state.getAttribute('inSwitchCaseBody');

    if (!inLoop && !inSwitchCaseBody) {
      parser.throw('Illegal break statement');
    }

    // labels are allowed only in loop bodies, NOT in switch case statement
    if (inLoop) {
      if (!parser.match(Punctuator.Semicolon)) {
        label = parser.parseExpression();

        if (!(label instanceof IdentifierExpression)) {
          parser.throw('Unexpected break label');
        }

        if (!parser.scope.hasLabel(label.name)) {
          parser.throw(`Undefined label ${label.name}`, ReferenceError);
        }
      }
    }

    parser.consume(Punctuator.Semicolon);

    return new BreakStatement(label);
  }
}
