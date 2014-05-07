import Expression from './Expression';

export default class MemberExpression extends Expression {
  constructor (object, property, computed = false) {
    super('MemberExpression');

    this.object = object;
    this.property = property;
    this.computed = computed;
  }

  eval (context) {

  }
}
