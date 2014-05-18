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

    var keys = {};
    var objectExpr = new ObjectExpression();

    if (!parser.match(Punctuator.CloseCurly)) {
      // parse object properties
      do {
        let property = this._parseObjectProperty(parser);

        // check key duplicity
        if (keys[property.keyName]) {
          parser.addWarning(`Duplicate object property '${property.keyName}'`);
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

  /**
   * Parses and returns one object property.
   */
  _parseObjectProperty (parser) {
    var objectProperty = new ObjectProperty();

    if (parser.matchType(TokenType.Identifier)) {
      objectProperty.key = IdentifierExpressionParser.parse(parser, true);

      // object expression method definition shorthand
      if (parser.matchAndConsume(Punctuator.OpenParen)) {
        let functionExpr = new FunctionExpression();
        let scopeVars = {
          arguments: Keyword.Var
        };

        if (!parser.matchAndConsume(Punctuator.CloseParen)) {
          let { params, defaults } = parser.parseArguments();

          parser.consume(Punctuator.CloseParen);

          functionExpr.params = params;
          functionExpr.defaults = defaults || [];

          // register parameters names to scope
          for (let param of functionExpr.params) {
            scopeVars[param.name] = Keyword.Var;
          }
        }

        // parse function body
        parser.state.pushAttribute('inFunction', true);
        functionExpr.body = parser.parseBlock(ScopeType.Function, scopeVars);
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
