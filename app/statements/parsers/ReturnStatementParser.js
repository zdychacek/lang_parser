import StatementParser from './StatementParser';
import { Punctuator } from '../../Lexer';
import ReturnStatement from '../ReturnStatement';

export default class ReturnStatementParser extends StatementParser {
  parse (parser, token) {
    var argument = null;

    if (!parser.state.inFunction) {
      throw new SyntaxError('Illegal return statement.');
    }

    if (!parser.matchAndConsume(Punctuator.Semicolon)) {
      argument = parser.parseExpression();
      parser.consume(Punctuator.Semicolon);
    }

    if (!parser.match(Punctuator.RightCurly)) {
      throw new SyntaxError('Unreachable statement.');
    }

    return new ReturnStatement(argument);
  }
}
