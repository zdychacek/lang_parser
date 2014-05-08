import Statement from './Statement';

export default class WhileStatement extends Statement {
  constructor (test, body) {
    super('WhileStatement');

    this.test = test;
    this.body = body;
  }

  eval (context) {
    
  }
}
