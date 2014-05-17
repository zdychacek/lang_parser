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

    var id = IdentifierExpressionParser.parse(parser, true);
    // array of default parameter values
    var defaults = [];
    // if at least one parameter has default value
    var hasDefaultValue = false;
    var scopeVars = {
      // inject arguments
      arguments: Keyword.Var
    };
    var params = [];
    var body = null;

    // defined variable in current scope
    parser.scope.define(id.name, Keyword.Var);

    parser.consume(Punctuator.OpenParen);

    // TODO: refactor this into separate method (parseArguments)
    if (!parser.match(Punctuator.CloseParen)) {
      // parse parameters
      do {
        let param = IdentifierExpressionParser.parse(parser, true);
        let defaultValue = null;

        // try to parse parameter default value
        if (parser.matchAndConsume(Punctuator.Assign)) {
          defaultValue = parser.parseExpression(Precedence.Sequence);
          hasDefaultValue = true;
        }

        // push parameter default value
        defaults.push(defaultValue);

        scopeVars[param.name] = Keyword.Var;
        params.push(param);
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);
    body = parser.parseBlock(ScopeType.Function, scopeVars);
    parser.state.popAttribute('inFunction');

    return new FunctionDeclarationStatement(id, params, body, hasDefaultValue? defaults : []);
  }
}
