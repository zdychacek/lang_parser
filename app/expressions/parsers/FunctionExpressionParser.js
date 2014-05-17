import {
  TokenType,
  Keyword,
  Punctuator,
  Precedence
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import FunctionExpression from '../FunctionExpression';

export default class FunctionExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    parser.consume(Keyword.Function);

    var functionExpr = new FunctionExpression();
    var scopeVars = {
      arguments: Keyword.Var
    };

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      functionExpr.id = IdentifierExpressionParser.parse(parser, true);

      // if function id was specified, then inject that id in the function scope
      scopeVars[functionExpr.id.name] = Keyword.Var;
    }

    parser.consume(Punctuator.OpenParen);

    // parse parameters
    if (!parser.match(Punctuator.CloseParen)) {
      let { params, defaults } = parser.parseArguments();

      functionExpr.params = params;
      functionExpr.defaults = defaults || [];

      // register parameters names to scope
      for (let param of functionExpr.params) {
        scopeVars[param.name] = Keyword.Var;
      }
    }

    parser.consume(Punctuator.CloseParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);
    functionExpr.body = parser.parseBlock(ScopeType.Function, scopeVars);
    parser.state.popAttribute('inFunction');

    return functionExpr;
  }
}
