import {
  Keyword,
  Punctuator
} from '../../Lexer';
import StatementParser from './StatementParser';
import DoWhileStatement from '../DoWhileStatement';

export default class DoWhileStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Do);

    var doWhileStmt = new DoWhileStatement();

    parser.state.pushAttribute('inLoop', true);
    doWhileStmt.body = parser.parseBlockOrExpression();
    parser.state.popAttribute('inLoop');

    parser.consume(Keyword.While);

    parser.consume(Punctuator.OpenParen);
    doWhileStmt.test = parser.parseExpression();
    parser.consume(Punctuator.CloseParen);

    parser.matchAndConsume(Punctuator.Semicolon);

    return doWhileStmt;
  }
}
