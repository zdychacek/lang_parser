import Statement from './Statement';

export default class IfStatement extends Statement {
  constructor (test, consequent, alternate) {
    super('IfStatement');

    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}
