export default class Node {
  constructor (type) {
    this.type = type;
  }

  accept (visitor) {
    var visitMethod = 'visit' + (visitor['visit' + this.type]? this.type : 'Any');
    console.log(this.type)
    console.log(visitor[visitMethod])
    return visitor[visitMethod](this);
  }
}
