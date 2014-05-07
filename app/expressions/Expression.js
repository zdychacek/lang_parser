export default class Expression {
  constructor (type) {
    this.type = type;
  }

  eval (context) {
    throw new Error('Not implemented.');
  }
}
