import PrefixParselet from './PrefixParselet';

export default class LiteralParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      type: 'Literal',
      value: token.value
    };
  }
}
