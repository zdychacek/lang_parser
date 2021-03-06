import {
  Punctuator,
  Keyword,
  TokenType
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import TryStatement from '../TryStatement';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';

/**
 * Implements try/catch/finally statement parser.
 */
export default class TryStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Try);

    var tryStmt = new TryStatement();

    // parse try block
    tryStmt.block = parser.parseBlock();

    // try to parse catch clause
    if (parser.matchAndConsume(Keyword.Catch)) {
      parser.consume(Punctuator.OpenParen);

      let catchParam = IdentifierExpressionParser.parse(parser);

      parser.consume(Punctuator.CloseParen);

      // create block scope and inject catch param in it
      let catchBody = parser.parseBlock();

      tryStmt.addHandler(catchParam, catchBody);
    }

    // try to parse finally block
    if (parser.matchAndConsume(Keyword.Finally)) {
      tryStmt.finalizer = parser.parseBlock();
    }
    // there must be catch clause or finally block defined
    else if (!tryStmt.handlers.length) {
      parser.throw('Missing catch or finally after try');
    }

    return tryStmt;
  }
}
