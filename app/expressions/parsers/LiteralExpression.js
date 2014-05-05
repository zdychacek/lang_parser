import PrefixExpressionParser from './PrefixExpressionParser';

export default class LiteralExpression extends PrefixExpressionParser {
  parse (parser, token) {
    return {
      type: 'Literal',
      value: token.value
    };
  }
}
