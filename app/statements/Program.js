import Statement from './Statement';

export default class Program extends Statement {
  constructor (body) {
    super('Program');

    this.body = body;
  }

  eval (context) {

  }
}
