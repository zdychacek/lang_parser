import Statement from './Statement';

export default class ForInStatement extends Statement {
  constructor (left, right, body) {
    super('ForInStatement');

    this.left = left;
    this.right = right;
    this.body = body;
  }

  eval (context) {

  }
}
