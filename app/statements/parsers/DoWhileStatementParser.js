import StatementParser from './StatementParser';
import DoWhileStatement from '../DoWhileStatement';
import { Keyword, Punctuator } from '../../Lexer';

export default class DoWhileStatementParser extends StatementParser {
  parse (parser, token) {
    var test = null;
    var body = null;

    var currInLoopState = parser.state.inLoop;
    parser.state.inLoop = true;

    if (parser.match(Punctuator.LeftCurly)) {
      body = parser.parseBlock();
    }
    else {
      body = parser.parseStatement();
    }

    parser.state.inLoop = currInLoopState;

    parser.consume(Keyword.While);
    parser.consume(Punctuator.LeftParen);
    test = parser.parseExpression();
    parser.consume(Punctuator.RightParen);

    parser.consume(Punctuator.Semicolon);

    return new DoWhileStatement(test, body);
  }
}
