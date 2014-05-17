import {
  TokenType,
  Punctuator,
  Keyword,
  Precedence
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import StatementParser from './StatementParser';
import IdentifierExpressionParser from '../../expressions/parsers/IdentifierExpressionParser';
import FunctionDeclarationStatement from '../FunctionDeclarationStatement';

export default class FunctionDeclarationStatementParser extends StatementParser {
  parse (parser) {
    parser.consume(Keyword.Function);

    var functionDeclStmt = new FunctionDeclarationStatement();
    var scopeVars = {
      arguments: Keyword.Var
    };

    // parse function name
    functionDeclStmt.id = IdentifierExpressionParser.parse(parser, true);
    // defined variable in current scope
    parser.scope.define(functionDeclStmt.id.name, Keyword.Var);

    parser.consume(Punctuator.OpenParen);

    // parse parameters
    if (!parser.match(Punctuator.CloseParen)) {
      let { params, defaults } = parser.parseArguments();

      functionDeclStmt.params = params;
      functionDeclStmt.defaults = defaults || [];

      // register parameters names to scope
      for (let param of functionDeclStmt.params) {
        scopeVars[param.name] = Keyword.Var;
      }
    }

    parser.consume(Punctuator.CloseParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);
    functionDeclStmt.body = parser.parseBlock(ScopeType.Function, scopeVars);
    parser.state.popAttribute('inFunction');

    return functionDeclStmt;
  }
}
