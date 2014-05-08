import Statement from './Statement';

export default class EmptyStatement extends Statement {
  constructor (expression) {
    super('EmptyStatement');
  }

  eval (context) {

  }
}
