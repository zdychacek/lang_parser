import PrefixParselet from './PrefixParselet';

export default class IdentifierParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      'Identifier': {
        name: token.value
      }
    };
  }
}
