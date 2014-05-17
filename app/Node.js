export default class Node {
  constructor (type) {
    this.type = type;
  }

  accept (visitor, ...params) {
    var visitMethod = 'visit' + (visitor['visit' + this.type]? this.type : 'Any');

    return visitor[visitMethod](this, ...params);
  }
}
