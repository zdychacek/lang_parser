export default class Node {
  constructor (type) {
    this.type = type;
  }

  accept (visitor) {
    visitor.visitAny(this);
  }
}
