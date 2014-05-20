import Statement from './Statement';

export default class WithStatement extends Statement {
  constructor (object, body) {
    super('WithStatement');

    this.object = object;
    this.body = body;
  }
}
