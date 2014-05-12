import Statement from './Statement';

export default class EmptyStatement extends Statement {
  constructor () {
    super('EmptyStatement');
  }

  accept (visitor) {
    return visitor.visitEmptyStatement(this);
  }
}
