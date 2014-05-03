import PrefixParselet from './PrefixParselet';

export default class IdentifierParselet extends PrefixParselet {
  parse (parser, token) {
    return {
      type: 'Identifier',
      name: token.value
    };
  }
}
