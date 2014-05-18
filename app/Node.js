export default class Node {
  constructor (type, line, column) {
    this.type = type;

    this.line = line;
    this.column = column;
  }

  accept (visitor, ...params) {
    var visitMethod = 'visit' + (visitor['visit' + this.type]? this.type : 'Any');

    return visitor[visitMethod](this, ...params);
  }
}
