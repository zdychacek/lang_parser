import Statement from './Statement';

export default class EmptyStatement extends Statement {
  constructor () {
    super('EmptyStatement');
  }

  eval (context) {

  }
}
