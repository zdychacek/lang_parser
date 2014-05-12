export default class Node {
  constructor (type) {
    this.type = type;
  }

  accept (visitor) {
    return visitor.visitAny(this);
  }
}
