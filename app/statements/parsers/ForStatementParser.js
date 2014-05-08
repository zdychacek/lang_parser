import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import ForStatement from '../ForStatement';
import DeclarationStatement from '../DeclarationStatement';
import ExpressionStatement from '../ExpressionStatement';

export default class ForStatementParser extends StatementParser {
  parse (parser) {
    var init = null;
    var test = null;
    var update = null;
    var currInLoopState = parser.state.inLoop;

    parser.consume(Punctuator.LeftParen);

    // init expression or declaration list
    if (!parser.match(Punctuator.Semicolon)) {
      init = parser.parseStatement();

      // must be ExpressionStatement or variable declarations list
      if (!(init instanceof ExpressionStatement || init instanceof DeclarationStatement)) {
        throw new SyntaxError('Unexpected init expression or declarations list.');
      }
    }
    else {
      parser.consume(Punctuator.Semicolon);
    }

    // parse test expression
    if (!parser.match(Punctuator.Semicolon)) {
      test = parser.parseExpression();
    }
    parser.consume();

    // parse update expression
    if (!parser.match(Punctuator.RightParen)) {
      update = parser.parseExpression();
    }

    parser.consume(Punctuator.RightParen);

    parser.state.inLoop = true;

    var body = parser.parseExpressionStatementOrBlock();

    parser.state.inLoop = currInLoopState;

    return new ForStatement(init, test, update, body);
  }
}
