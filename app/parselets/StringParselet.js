import PrefixParselet from './PrefixParselet';

export default class StringParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      type: 'String',
      value: token.value
    };
  }
}
