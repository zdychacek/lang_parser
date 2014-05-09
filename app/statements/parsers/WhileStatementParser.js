import StatementParser from './StatementParser';
import WhileStatement from '../WhileStatement';
import { Punctuator } from '../../Lexer';

export default class WhileStatementParser extends StatementParser {
  parse (parser, token) {
    parser.consume(Punctuator.LeftParen);
    var test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    parser.state.pushAttribute('inLoop', true);
    var body = parser.parseBlockOrExpression();
    parser.state.popAttribute('inLoop');

    return new WhileStatement(test, body);
  }
}
