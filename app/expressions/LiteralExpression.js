import PrefixExpression from './PrefixExpression';

export default class LiteralExpression extends PrefixExpression {
  parse (parser, token) {
    return {
      type: 'Literal',
      value: token.value
    };
  }
}
