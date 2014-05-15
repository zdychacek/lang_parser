export default class ExpressionParser {
  parse (parser) {
    throw new Error('Not implemented.');
  }

  static parse () {
    return new this().parse(...arguments);
  }
}
