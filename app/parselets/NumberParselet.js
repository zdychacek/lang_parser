import PrefixParselet from './PrefixParselet';

export default class NumberParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      'Number': {
        value: token.value
      }
    };
  }
}
