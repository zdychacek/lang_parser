import Expression from './Expression';
import IdentifierExpression from './IdentifierExpression';

export class ObjectProperty extends Expression {
  constructor (key, value) {
    super('ObjectProperty');

    this.key = key;
    this.value = value;
  }

  get keyName () {
    if (this.key instanceof IdentifierExpression) {
      return this.key.name;
    }
    else {
      return this.key.value;
    }
  }
}

export class ObjectExpression extends Expression {
  constructor (properties = []) {
    super('ObjectExpression');

    this.properties = properties;
  }

  addProperty (key, value) {
    this.properties.push(new ObjectProperty(key, value));
  }
}
