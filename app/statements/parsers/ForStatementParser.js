import {
  Punctuator,
  Keyword,
  Precedence
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import ForStatement from '../ForStatement';
import ForInStatement from '../ForInStatement';
import IdentifierExpression from '../../expressions/IdentifierExpression';
import { DeclarationStatement } from '../DeclarationStatement';
import Expression from '../../expressions/Expression';

export default class ForStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.For);

    var stmt = null;
    var leftOrInit = null;

    parser.consume(Punctuator.OpenParen);

    // init expression or declaration list
    if (parser.matchAndConsume(Punctuator.Semicolon)) {
      stmt = this._parseForLoop(parser, leftOrInit);
    }
    else {
      if (parser.match(Keyword.Var) || parser.match(Keyword.Let)) {
        leftOrInit = parser.parseStatement({ consumeSemicolon: false, withoutDefinition: true });
      }
      else {
        parser.state.pushAttribute('allowIn', false);
        leftOrInit = parser.parseExpression();
        parser.state.popAttribute('allowIn');
      }

      if (parser.matchAndConsume(Keyword.In)) {
        stmt = this._parseForInLoop(parser, leftOrInit);
      }
      else {
        parser.consume(Punctuator.Semicolon);
        stmt = this._parseForLoop(parser, leftOrInit);
      }
    }

    parser.consume(Punctuator.CloseParen);

    // parse body
    parser.state.pushAttribute('inLoop', true);
    // must create new scope for FOR body even if it is expression statement
    stmt.body = parser.parseBlockOrExpression(stmt.declarations, true);
    parser.state.popAttribute('inLoop');

    return stmt;
  }

  _parseForLoop (parser, init) {
    var forStmt = new ForStatement();

    // must be ExpressionStatement or variable declarations list
    if (init && !(init instanceof Expression || init instanceof DeclarationStatement)) {
      parser.throw('Unexpected init expression or declarations list');
    }

    forStmt.init = init;

    // we must create temporary function scope for declarations
    parser.pushScope(ScopeType.Function, forStmt.declarations);

    // parse test expression
    if (!parser.match(Punctuator.Semicolon)) {
      forStmt.test = parser.parseExpression();
    }

    parser.consume(Punctuator.Semicolon);

    // parse update expression
    if (!parser.match(Punctuator.CloseParen)) {
      forStmt.update = parser.parseExpression();
    }

    // pop temporary scope
    parser.popScope();

    return forStmt;
  }

  _parseForInLoop (parser, left) {
    var forInStmt = new ForInStatement(left);
    var isIdentifier = left instanceof IdentifierExpression;
    var isDeclaration = left instanceof DeclarationStatement;

    if (isDeclaration && left.declarations.length != 1) {
      parser.throw('Unexpected interator');
    }

    if (!isDeclaration && !isIdentifier) {
      if (!isIdentifier) {
        parser.throw('Invalid left-hand side in for-in');
      }
    }

    // we must create temporary function scope for declarations
    parser.pushScope(ScopeType.Function, forInStmt.declarations);
    forInStmt.right = parser.parseExpression();
    // pop temporary scope
    parser.popScope();

    return forInStmt;
  }
}
