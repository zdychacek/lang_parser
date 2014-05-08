import Statement from './Statement';

export default class ReturnStatement extends Statement {
  constructor (argument) {
    super('ReturnStatement');

    this.argument = argument;
  }

  eval (context) {

  }
}
