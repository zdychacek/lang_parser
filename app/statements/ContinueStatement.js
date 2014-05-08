import Statement from './Statement';

export default class ContinueStatement extends Statement {
  constructor (label = null) {
    super('ContinueStatement');

    this.label = label;
  }

  eval (context) {

  }
}
