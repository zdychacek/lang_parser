import {
  Punctuator,
  Keyword
} from '../../Lexer';
import StatementParser from './StatementParser';
import ReturnStatement from '../ReturnStatement';

export default class ReturnStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Return);

    var argument = null;

    if (!parser.state.getAttribute('inFunction')) {
      parser.throw('Illegal return statement');
    }

    if (!parser.match(Punctuator.Semicolon)) {
      // return statement must not end with new line
      if (parser.peekLineTerminator()) {
        parser.throw('Unexpected new line after return statement');
      }

      argument = parser.parseExpression();
    }

    parser.consume(Punctuator.Semicolon);

    if (!parser.match(Punctuator.CloseCurly)) {
      parser.throw('Unreachable statement');
    }

    return new ReturnStatement(argument);
  }
}
