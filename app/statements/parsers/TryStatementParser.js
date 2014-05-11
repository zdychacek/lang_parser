import {
  Punctuator,
  Keyword,
  TokenType
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import TryStatement from '../TryStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

export default class TryStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Try);

    var tryStmt = new TryStatement();

    // parse try block
    tryStmt.block = parser.parseBlock(ScopeType.Block);

    // try to parse catch clause
    if (parser.matchAndConsume(Keyword.Catch)) {
      parser.consume(Punctuator.OpenParen);

      let catchParamToken = parser.consumeType(TokenType.Identifier);
      let catchParam = IdentifierExpressionParser.parse(parser, catchParamToken, true);

      parser.consume(Punctuator.CloseParen);

      // create block scope and inject catch param in it
      let catchBody = parser.parseBlock(ScopeType.Block, {
        [ catchParam.name ]: Keyword.Let
      });

      tryStmt.addHandler(catchParam, catchBody);
    }

    // try to parse finally block
    if (parser.matchAndConsume(Keyword.Finally)) {
      tryStmt.finalizer = parser.parseBlock(ScopeType.Block);
    }
    // there must be catch clause or finally block defined
    else if (!tryStmt.handlers.length) {
      parser.throw('Missing catch or finally after try');
    }

    return tryStmt;
  }
}
