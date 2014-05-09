import StatementParser from './StatementParser';
import { Punctuator, Keyword, Precedence } from '../../Lexer';
import ForStatement from '../ForStatement';
import ForInStatement from '../ForInStatement';
import IdentifierExpression from '../../expressions/IdentifierExpression';
import DeclarationStatement from '../DeclarationStatement';
import ExpressionStatement from '../ExpressionStatement';

export default class ForStatementParser extends StatementParser {
  parse (parser) {
    var forStmt = null;
    var leftOrInit = null;

    // create new block scope
    parser.pushScope(true);

    parser.consume(Punctuator.LeftParen);

    // init expression or declaration list
    if (parser.match(Punctuator.Semicolon)) {
      parser.consume();
      forStmt = this._parseForLoop(parser, leftOrInit);
    }
    else {
      if (parser.match(Keyword.Var) || parser.match(Keyword.Let)) {
        leftOrInit = parser.parseStatement({ consumeSemicolon: false });
      }
      else {
        parser.state.pushAttribute('allowIn', false);
        leftOrInit = parser.parseExpression();
        parser.state.popAttribute('allowIn');
      }

      if (parser.match(Keyword.In)) {
        parser.consume();
        forStmt = this._parseForInLoop(parser, leftOrInit);
      }
      else {
        parser.consume(Punctuator.Semicolon);
        forStmt = this._parseForLoop(parser, leftOrInit);
      }
    }

    parser.consume(Punctuator.RightParen);

    // parse body
    parser.state.pushAttribute('inLoop', true);
    forStmt.body = parser.parseBlockOrExpression(false);
    parser.state.popAttribute('inLoop');

    parser.popScope();

    return forStmt;
  }

  _parseForLoop (parser, init) {
    var test = update = null;
    var update = null;

    // must be ExpressionStatement or variable declarations list
    if (init && !(init instanceof ExpressionStatement || init instanceof DeclarationStatement)) {
      throw new SyntaxError('Unexpected init expression or declarations list.');
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

    return new ForStatement(init, test, update);
  }

  _parseForInLoop (parser, left) {
    var isIdentifier = left instanceof IdentifierExpression;
    var isDeclaration = left instanceof DeclarationStatement;

    if (isDeclaration && left.declarations.length != 1) {
      throw new SyntaxError('Unexpected interator.');
    }

    if (!isDeclaration && !isIdentifier) {
      if (!isIdentifier) {
        throw new SyntaxError('Invalid left-hand side in for-in.');
      }
    }

    return new ForInStatement(left, parser.parseExpression());
  }
}
