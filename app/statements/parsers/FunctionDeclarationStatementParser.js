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

    // parse function name
    functionDeclStmt.id = IdentifierExpressionParser.parse(parser);

    parser.consume(Punctuator.OpenParen);

    // parse parameters
    if (!parser.match(Punctuator.CloseParen)) {
      let { params, defaults, rest } = parser.parseArguments();

      functionDeclStmt.params = params;
      functionDeclStmt.defaults = defaults || [];
    }

    parser.consume(Punctuator.CloseParen);

    // parse function body
    parser.state.pushAttribute('inFunction', true);
    functionDeclStmt.body = parser.parseBlock();
    parser.state.popAttribute('inFunction');

    return functionDeclStmt;
  }
}
