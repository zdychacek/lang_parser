import Statement from './Statement';

export default class DoWhileStatement extends Statement {
  constructor (test, body) {
    super('DoWhileStatement');

    this.test = test;
    this.body = body;
  }
}
