import {
  Keyword,
  Punctuator
} from '../../Lexer';
import StatementParser from './StatementParser';
import DoWhileStatement from '../DoWhileStatement';

export default class DoWhileStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Do);

    parser.state.pushAttribute('inLoop', true);
    var body = parser.parseBlockOrExpression();
    parser.state.popAttribute('inLoop', true);

    parser.consume(Keyword.While);
    parser.consume(Punctuator.LeftParen);

    var test = parser.parseExpression();

    parser.consume(Punctuator.RightParen);

    return new DoWhileStatement(test, body);
  }
}
