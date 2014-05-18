import {
  Punctuator,
  TokenType
} from '../../Lexer';
import StatementParser from './StatementParser';
import LabeledStatement from '../LabeledStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class LabeledStatementParser extends StatementParser {
  parse (parser) {
    var labelStmt = new LabeledStatement();

    labelStmt.label = IdentifierExpressionParser.parse(parser, true);

    parser.consume(Punctuator.Colon);

    // save label name
    //parser.scope.addLabel(labelStmt.label.name);

    if (parser.match(Punctuator.OpenCurly)) {
      labelStmt.body = parser.parseBlock();
    }
    else {
      labelStmt.body = parser.parseStatement();
    }

    return labelStmt;
  }
}
