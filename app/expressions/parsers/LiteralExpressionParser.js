import PrefixExpressionParser from './PrefixExpressionParser';

export default class LiteralExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    return {
      type: 'Literal',
      value: token.value
    };
  }
}
