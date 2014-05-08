import Statement from './Statement';

export default class BreakStatement extends Statement {
  constructor (label = null) {
    super('BreakStatement');

    this.label = label;
  }

  eval (context) {

  }
}
