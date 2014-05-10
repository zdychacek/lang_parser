import Statement from './Statement';

export default class ThrowStatement extends Statement {
  constructor (argument) {
    super('ThrowStatement');

    this.argument = argument;
  }

  eval (context) {

  }
}
