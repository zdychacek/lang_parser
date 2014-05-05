import PrefixExpressionParser from './PrefixExpressionParser';

export default class IdentifierExpressionParser extends PrefixExpressionParser {
  parse (parser, token) {
    return {
      type: 'Identifier',
      name: token.value
    };
  }
}
