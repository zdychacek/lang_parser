import PrefixExpression from './PrefixExpression';

export default class IdentifierExpression extends PrefixExpression {
  parse (parser, token) {
    return {
      type: 'Identifier',
      name: token.value
    };
  }

  static parse (parser, token) {
    return new this().parse(parser, token);
  }
}
