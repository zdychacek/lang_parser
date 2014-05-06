import Statement from './Statement';

export default class BlockStatement extends Statement {
  constructor (body) {
    super('BlockStatement');

    this.body = body;
  }

  eval (context) {
    
  }
}
