export default class ExpressionParser {
  parse (parser, token) {
    throw new Error('Not implemented.');
  }

  static parse (parser, token) {
    return new this().parse(parser, token);
  }
}
