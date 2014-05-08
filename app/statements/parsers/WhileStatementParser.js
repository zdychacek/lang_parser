import StatementParser from './StatementParser';
import WhileStatement from '../WhileStatement';
import { Punctuator } from '../../Lexer';

export default class WhileStatementParser extends StatementParser {
  parse (parser, token) {
    var test = null;

    parser.consume(Punctuator.LeftParen);
    test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    var currInLoopState = parser.state.inLoop;
    parser.state.inLoop = true;

    var body = parser.parseExpressionStatementOrBlock();

    parser.state.inLoop = currInLoopState;

    return new WhileStatement(test, body);
  }
}
