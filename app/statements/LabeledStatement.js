import Statement from './Statement';

export default class LabeledStatement extends Statement {
  constructor (label, body) {
    super('LabeledStatement');

    this.label = label;
    this.body = body;
  }
}
