import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import LiteralExpressionParser from './LiteralExpressionParser';
import { TokenType, Precedence, Punctuator } from '../../Lexer';

export default class ObjectExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    var properties = [];
    var keys = {};

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
        properties.push(this._makeProperty(keyToken, parser.parseExpression()));

        // note property name
        keys[key] = true;
      } while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.RightCurly);

    return {
      type: 'ObjectExpression',
      properties
    };
  }

  _makeProperty (key, value) {
    return {
      type: 'Property',
      key,
      value
    };
  }
}
