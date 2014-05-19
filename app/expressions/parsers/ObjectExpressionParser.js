import {
  TokenType,
  Precedence,
  Punctuator,
  Keyword
} from '../../Lexer';
import { ScopeType } from '../../Scope';
import PrefixExpressionParser from './PrefixExpressionParser';
import IdentifierExpressionParser from './IdentifierExpressionParser';
import LiteralExpressionParser from './LiteralExpressionParser';
import {
  ObjectExpression,
  ObjectProperty
} from '../ObjectExpression';
import FunctionExpression from '../FunctionExpression';

export default class ObjectExpressionParser extends PrefixExpressionParser {
  parse (parser) {
    var token = parser.consume(Punctuator.OpenCurly);

    var objectExpr = new ObjectExpression();

    if (!parser.match(Punctuator.CloseCurly)) {
      // parse object properties
      do {
        let property = this._parseObjectProperty(parser);

        // add new property
        objectExpr.properties.push(property);
      }
      while (parser.matchAndConsume(Punctuator.Comma));
    }

    parser.consume(Punctuator.CloseCurly);

    return objectExpr;
  }

  /**
   * Parses and returns one object property.
   */
  _parseObjectProperty (parser) {
    var objectProperty = new ObjectProperty();

    if (parser.matchType(TokenType.Identifier)) {
      objectProperty.key = IdentifierExpressionParser.parse(parser);

      // object expression method definition shorthand
      if (parser.matchAndConsume(Punctuator.OpenParen)) {
        let functionExpr = new FunctionExpression();

        if (!parser.matchAndConsume(Punctuator.CloseParen)) {
          let { params, defaults } = parser.parseArguments();

          parser.consume(Punctuator.CloseParen);

          functionExpr.params = params;
          functionExpr.defaults = defaults || [];
        }

        // parse function body
        parser.state.pushAttribute('inFunction', true);
        functionExpr.body = parser.parseBlock();
        parser.state.popAttribute('inFunction');

        objectProperty.value = functionExpr;
        objectProperty.shorthand = true;
      }
      else {
        // classic property
        if (parser.matchAndConsume(Punctuator.Colon)) {
          objectProperty.value = parser.parseExpression(Precedence.Sequence);
        }
        // member definition shorthand
        else {
          objectProperty.value = objectProperty.key;
          objectProperty.shorthand = true;
        }
      }
    }
    // literal property key
    else if (parser.matchType(TokenType.Literal)) {
      objectProperty.key = LiteralExpressionParser.parse(parser);
      parser.consume(Punctuator.Colon);
      objectProperty.value = parser.parseExpression(Precedence.Sequence);
    }
    else {
      parser.throw('Bad object property name');
    }

    return objectProperty;
  }
}
