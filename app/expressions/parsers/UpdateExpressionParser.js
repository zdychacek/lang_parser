import { Precedence } from '../../Lexer';
import ExpressionParser from './ExpressionParser';
import UpdateExpression from '../UpdateExpression';
import IdentifierExpression from '../IdentifierExpression';

export default class UpdateExpressionParser extends ExpressionParser {
  constructor (prefix) {
    this._prefix = prefix;
  }

  parse (parser, left) {
    var token = parser.consume();
    var argument = null;
    var operator = null;

    // prefix
    if (this._prefix) {
      argument = parser.parseExpression(this.precedence);
      operator = token.value;
    }
    // postfix
    else {
      argument = left;
      operator = token.value;
    }

    if (!(argument instanceof IdentifierExpression)) {
      parser.throw('The left-hand side of an assignment must be an identifier');
    }

    return new UpdateExpression(operator, argument, this._prefix);
  }

  get precedence () {
    if (this._prefix) {
      return Precedence.Prefix;
    }
    else {
      return Precedence.Postfix;
    }
  }
}
