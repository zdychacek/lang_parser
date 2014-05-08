import Statement from './Statement';

export default class ForStatement extends Statement {
  constructor (init = null, test = null, update = null, body) {
    super('ForStatement');

    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }

  eval (context) {

  }
}
