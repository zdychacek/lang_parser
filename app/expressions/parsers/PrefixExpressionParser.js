export default class PrefixExpressionParser {
  parse (parser, token) {
    throw new Error('Not implemented.');
  }

  static parse (parser, token) {
    return new this().parse(parser, token);
  }
}
