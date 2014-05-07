import InfixExpressionParser from './InfixExpressionParser';
import { Precedence, Punctuator } from '../../Lexer';
import MemberExpression from '../MemberExpression';

export default class MemberExpressionParser extends InfixExpressionParser {
  constructor (computed = false) {
    this.computed = computed;
  }

  parse (parser, left, token) {
    var object = left;
    var property = null;

    if (this.computed) {
      property = parser.parseExpression();
      parser.consume(Punctuator.RightSquare);
    }
    else {
      property = parser.parseExpression(this.precedence);

      if (property.type != 'Identifier') {
        throw new Error('Unexpected expression.');
      }
    }

    return new MemberExpression(object, property, this.computed);
  }

  get precedence () {
    return Precedence.Member;
  }
}
