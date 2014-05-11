import {
  Punctuator,
  TokenType
} from '../../Lexer';
import StatementParser from './StatementParser';
import LabeledStatement from '../LabeledStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class LabeledStatementParser extends StatementParser {
  parse (parser) {
    var labelToken = parser.consumeType(TokenType.Identifier);
    var label = IdentifierExpressionParser.parse(parser, labelToken, true);
    var body = null;

    parser.consume(Punctuator.Colon);

    // save label name
    parser.scope.addLabel(label.name);

    if (parser.match(Punctuator.LeftCurly)) {
      body = parser.parseBlock();
    }
    else {
      body = parser.parseStatement();
    }

    return new LabeledStatement(label, body);
  }
}
