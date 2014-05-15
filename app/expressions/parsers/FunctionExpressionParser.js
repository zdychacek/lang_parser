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
    var token = parser.consume(Keyword.Function);

    var id = null;
    var params = [];
    var body = null;
    // array of default parameter values
    var defaults = [];
    // if at least one parameter has default value
    var hasDefaultValue = false;
    var scopeVars = {
      // inject arguments
      arguments: Keyword.Var
    };

    // parse optional name
    if (parser.matchType(TokenType.Identifier)) {
      id = IdentifierExpressionParser.parse(parser, true);
    }

    parser.consume(Punctuator.OpenParen);

    if (!parser.match(Punctuator.CloseParen)) {
      // parse parameters
      do {
        let param = IdentifierExpressionParser.parse(parser, true);

        /*if (!parser.matchType(TokenType.Identifier, paramToken)) {
          parser.throw('Unexpected token ILLEGAL');
        }*/

        let defaultValue = null;

        // try to parse parameter default value
        if (parser.matchAndConsume(Punctuator.Assign)) {
          defaultValue = parser.parseExpression(Precedence.Sequence);
          hasDefaultValue = true;
        }

        defaults.push(defaultValue);

        scopeVars[param.name] = Keyword.Var;
        params.push();
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseParen);

    // if function id was specified, then inject that id in the function scope
    if (id) {
      scopeVars[id.name] = Keyword.Var;
    }

    // parse function body
    parser.state.pushAttribute('inFunction', true);

    body = parser.parseBlock(ScopeType.Function, scopeVars);

    parser.state.popAttribute('inFunction');

    return new FunctionExpression(id, params, body, hasDefaultValue? defaults : []);
  }
}
