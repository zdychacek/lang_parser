import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import LiteralExpressionParser from './LiteralExpressionParser';
import { TokenType, Precedence, Punctuator } from '../../Lexer';
import ObjectExpression from '../ObjectExpression';

export default class ObjectExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var keys = {};
    var objectExpr = new ObjectExpression();

    if (!parser.match(Punctuator.RightCurly)) {
      do {
        let keyToken = parser.consume();
        let key = keyToken.value;

        // check key duplicity
        if (keys[key]) {
          keyToken.error(`Duplicate object property.`);
        }

        if (parser.matchType(TokenType.Identifier, keyToken)) {
          keyToken = IdentifierExpressionParser.parse(parser, keyToken);
        }
        else if (parser.matchType(TokenType.Literal, keyToken)) {
          keyToken = LiteralExpressionParser.parse(parser, keyToken);
        }
        else {
          keyToken.error('Bad object property name.');
        }

        parser.consume(Punctuator.Colon);

        // add new property
        objectExpr.addProperty(keyToken, parser.parseExpression(Precedence.Sequence));

        // note property name to avoid key duplicity
        keys[key] = true;
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightCurly);

    return objectExpr;
  }
}
