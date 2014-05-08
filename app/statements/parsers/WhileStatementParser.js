import StatementParser from './StatementParser';
import WhileStatement from '../WhileStatement';
import { Punctuator } from '../../Lexer';

export default class WhileStatementParser extends StatementParser {
  parse (parser, token) {
    var test = null;
    var body = null;

    parser.consume(Punctuator.LeftParen);
    test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    var currInLoopState = parser.state.inLoop;
    parser.state.inLoop = true;

    if (parser.match(Punctuator.LeftCurly)) {
      body = parser.parseBlock();
    }
    else {
      body = parser.parseStatement();
    }

    parser.state.inLoop = currInLoopState;

    return new WhileStatement(test, body);
  }
}
