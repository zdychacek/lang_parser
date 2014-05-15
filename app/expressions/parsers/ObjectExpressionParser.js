import {
  TokenType,
  Precedence,
  Punctuator
} from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import LiteralExpressionParser from './LiteralExpressionParser';
import ObjectExpression from '../ObjectExpression';

export default class ObjectExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consume(Punctuator.OpenCurly);

    var keys = {};
    var objectExpr = new ObjectExpression();

    if (!parser.match(Punctuator.CloseCurly)) {
      do {
        let key = null;

        if (parser.matchType(TokenType.Identifier)) {
          key = IdentifierExpressionParser.parse(parser, true);
        }
        else if (parser.matchType(TokenType.Literal)) {
          key = LiteralExpressionParser.parse(parser);
        }
        else {
          parser.throw('Bad object property name');
        }

        // check key duplicity
        if (keys[key]) {
          parser.throw(`Duplicate object property '${key}'`);
        }

        parser.consume(Punctuator.Colon);

        // add new property
        objectExpr.addProperty(key, parser.parseExpression(Precedence.Sequence));

        // note property name to avoid key duplicity
        keys[key.name] = true;
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseCurly);

    return objectExpr;
  }
}
