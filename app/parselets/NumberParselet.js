import PrefixParselet from './PrefixParselet';

export default class NumberParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      type: 'Number',
      value: token.value
    };
  }
}
