import {
  Precedence,
  Punctuator,
  TokenType
} from '../../Lexer';
import InfixExpressionParser from './InfixExpressionParser';
import MemberExpression from '../MemberExpression';
import IdentifierExpression from '../IdentifierExpression';
import IdentifierExpressionParser from './IdentifierExpressionParser';

export default class MemberExpressionParser extends InfixExpressionParser {
  constructor (computed = false) {
    this.computed = computed;
  }

  parse (parser, left) {
    var token = parser.consume();

    var object = left;
    var property = null;

    if (this.computed) {
      property = parser.parseExpression();
      parser.consume(Punctuator.CloseSquare);
    }
    else {
      property = IdentifierExpressionParser.parse(parser, true);
    }

    return new MemberExpression(object, property, this.computed);
  }

  get precedence () {
    return Precedence.Member;
  }
}
