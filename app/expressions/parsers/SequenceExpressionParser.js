import {
  Precedence,
  Punctuator
} from '../../Lexer';
import InfixExpressionParser from './InfixExpressionParser';
import SequenceExpression from '../SequenceExpression';

export default class SequenceExpressionParser extends InfixExpressionParser {
  parse (parser, left) {
    var token = parser.consume(Punctuator.Comma);

    var sequenceExpr = new SequenceExpression();

    sequenceExpr.addExpression(left);

    do {
      sequenceExpr.addExpression(parser.parseExpression(this.precedence));
    }
    while (parser.matchAndConsume(Punctuator.Comma));

    return sequenceExpr;
  }

  get precedence () {
    return Precedence.Sequence;
  }
}
