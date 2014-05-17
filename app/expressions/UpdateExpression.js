import UnaryExpression from './UnaryExpression';

export default class UpdateExpression extends UnaryExpression {
  constructor (operator, argument, prefix = false) {
    super(...arguments);

    this.type = 'UpdateExpression';
  }
}
