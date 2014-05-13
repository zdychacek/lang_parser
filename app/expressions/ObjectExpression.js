import Expression from './Expression';

class ObjectProperty extends Expression {
  constructor (key, value) {
    super('ObjectProperty');

    this.key = key;
    this.value = value;
  }
}

export default class ObjectExpression extends Expression {
  constructor (properties = []) {
    super('ObjectExpression');

    this.properties = properties;
  }

  addProperty (key, value) {
    this.properties.push(new ObjectProperty(key, value));
  }
}
