import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import WhileStatement from '../WhileStatement';

export default class WhileStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.While);

    parser.consume(Punctuator.OpenParen);
    var test = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    parser.state.pushAttribute('inLoop', true);
    var body = parser.parseBlockOrExpression();
    parser.state.popAttribute('inLoop');

    return new WhileStatement(test, body);
  }
}
