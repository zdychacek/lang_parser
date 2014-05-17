import Statement from './Statement';

class SwitchCase extends Statement {
  constructor (test, consequent) {
    super('SwitchCase');

    this.test = test;
    this.consequent = consequent;
  }
}

export default class SwitchStatement extends Statement {
  constructor (discriminant, cases = []) {
    super('SwitchStatement');

    this.discriminant = discriminant;
    this.cases = cases;
  }

  addCase (test, consequent) {
    this.cases.push(new SwitchCase(test, consequent));
  }
}
