import StatementParser from './StatementParser';
import DoWhileStatement from '../DoWhileStatement';
import { Keyword, Punctuator } from '../../Lexer';

export default class DoWhileStatementParser extends StatementParser {
  parse (parser, token) {
    parser.state.pushAttribute('inLoop', true);

    var body = parser.parseExpressionStatementOrBlock();

    parser.state.popAttribute('inLoop', true);

    parser.consume(Keyword.While);
    parser.consume(Punctuator.LeftParen);

    var test = parser.parseExpression();

    parser.consume(Punctuator.RightParen);

    return new DoWhileStatement(test, body);
  }
}
