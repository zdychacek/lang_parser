import ExpressionParser from './ExpressionParser';

export default class InfixExpressionParser extends ExpressionParser {
  get precedence () {
    throw new Error('Not implemented.');
  }
}
