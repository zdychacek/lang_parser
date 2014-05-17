import {
  TokenType,
  Precedence,
  Punctuator
} from '../../Lexer';
import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import LiteralExpressionParser from './LiteralExpressionParser';
import {
  ObjectExpression,
  ObjectProperty
} from '../ObjectExpression';

export default class ObjectExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consume(Punctuator.OpenCurly);

    var keys = {};
    var objectExpr = new ObjectExpression();

    if (!parser.match(Punctuator.CloseCurly)) {
      do {
        let property = this._parseObjectProperty(parser);

        // check key duplicity
        if (keys[property.keyName]) {
          parser.throw(`Duplicate object property '${property.keyName}'`);
        }

        // note property name to avoid key duplicity
        keys[property.keyName] = true;

        // add new property
        objectExpr.properties.push(property);
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseCurly);

    return objectExpr;
  }

  _parseObjectProperty (parser) {
    var objectProperty = new ObjectProperty();

    if (parser.matchType(TokenType.Identifier)) {
      objectProperty.key = IdentifierExpressionParser.parse(parser, true);
    }
    else if (parser.matchType(TokenType.Literal)) {
      objectProperty.key = LiteralExpressionParser.parse(parser);
    }
    else {
      parser.throw('Bad object property name');
    }

    parser.consume(Punctuator.Colon);

    objectProperty.value = parser.parseExpression(Precedence.Sequence);

    return objectProperty;
  }
}
