import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import ForStatement from '../ForStatement';
import DeclarationStatement from '../DeclarationStatement';
import Expression from '../../expressions/Expression';

export default class ForStatementParser extends StatementParser {
  parse (parser) {
    var init = null;
    var test = null;
    var update = null;
    var currInLoopState = parser.state.inLoop;

    parser.consume(Punctuator.LeftParen);

    // init expression or declaration list
    if (!parser.matchAndConsume(Punctuator.Semicolon)) {
      init = parser.parseStatement(false);

      // must be expression or variable declarations list
      if (!(init instanceof Expression || init instanceof DeclarationStatement)) {
        throw new SyntaxError('Unexpected for init expression or declarations list.');
      }
    }

    test = parser.parseExpression();

    // update expression
    if (!parser.matchAndConsume(Punctuator.Semicolon)) {
      update = parser.parseExpression();
    }

    parser.consume(Punctuator.RightParen);

    parser.state.inLoop = true;

    var body = parser.parseExpressionStatementOrBlock();

    parser.state.inLoop = currInLoopState;

    return new ForStatement(init, test, update, body);
  }
}
