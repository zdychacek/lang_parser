import Statement from './Statement';

export default class ReturnStatement extends Statement {
  constructor (argument) {
    super('ReturnStatement');

    this.argument = argument;
  }

  accept (visitor) {
    return visitor.visitReturnStatement(this);
  }
}
