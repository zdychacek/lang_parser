import {
  Punctuator,
  Keyword,
  TokenType
} from '../../Lexer';
import StatementParser from './StatementParser';
import BreakStatement from '../BreakStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class BreakStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Break);

    var inLoop = parser.state.getAttribute('inLoop');
    var inSwitchCaseBody = parser.state.getAttribute('inSwitchCaseBody');

    if (parser.matchAndConsume(Punctuator.Semicolon)) {
      if (!inLoop && !inSwitchCaseBody) {
        parser.throw('Illegal break statement');
      }

      return new BreakStatement(null);
    }

    if (parser.peekLineTerminator()) {
      if (!inLoop && !inSwitchCaseBody) {
        parser.throw('Illegal break statement');
      }

      return new BreakStatement(null);
    }

    var label = null;

    if (parser.matchType(TokenType.Identifier)) {
      if (inSwitchCaseBody) {
        parser.throw('Unexpected break label');
      }

      label = IdentifierExpressionParser.parse(parser, true);

      /*if (!parser.scope.hasLabel(label.name)) {
        parser.throw(`Undefined label ${label.name}`, ReferenceError);
      }*/
    }

    if (!inLoop) {
      parser.throw('Illegal break statement');
    }

    parser.consumeSemicolon();

    return new BreakStatement(label);
  }
}
