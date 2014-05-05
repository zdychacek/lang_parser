export default class InfixExpressionParser {
  parse (parser, left, token) {
    throw new Error('Not implemented.');
  }

  get precedence () {
    throw new Error('Not implemented.');
  }

  static parse (parser, token) {
    return new this().parse(parser, token);
  }
}
