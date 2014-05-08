import Expression from './Expression';

class Property extends Expression {
  constructor (key, value) {
    super('Property');

    this.key = key;
    this.value = value;
  }

  eval (context) {

  }
}

export default class ObjectExpression extends Expression {
  constructor (properties = []) {
    super('ObjectExpression');

    this.properties = properties;
  }

  addProperty (key, value) {
    this.properties.push(new Property(key, value));
  }

  eval (context) {

  }
}
