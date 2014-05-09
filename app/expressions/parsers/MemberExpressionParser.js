import InfixExpressionParser from './InfixExpressionParser';
import { Precedence, Punctuator, TokenType } from '../../Lexer';
import MemberExpression from '../MemberExpression';
import IdentifierExpression from '../IdentifierExpression';
import IdentifierExpressionParser from './IdentifierExpressionParser';

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
      let propertyToken = parser.consumeType(TokenType.Identifier);
      
      property = IdentifierExpressionParser.parse(parser, propertyToken, true);
    }

    return new MemberExpression(object, property, this.computed);
  }

  get precedence () {
    return Precedence.Member;
  }
}
