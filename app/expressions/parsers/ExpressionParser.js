export default class ExpressionParser {
  parse (parser, token) {
    throw new Error('Not implemented.');
  }

  static parse () {
    return new this().parse(...arguments);
  }
}
