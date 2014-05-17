import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import WhileStatement from '../WhileStatement';

export default class WhileStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.While);

    var whileStmt = new WhileStatement();

    parser.consume(Punctuator.OpenParen);
    whileStmt.test = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    parser.state.pushAttribute('inLoop', true);
    whileStmt.body = parser.parseBlockOrExpression();
    parser.state.popAttribute('inLoop');

    return whileStmt;
  }
}
