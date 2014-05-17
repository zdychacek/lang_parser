import Statement from './Statement';
import { DeclarationStatement } from './DeclarationStatement';

export default class ForStatement extends Statement {
  constructor (init = null, test = null, update = null, body) {
    super('ForStatement');

    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }

  get declarations () {
    var names = {};

    if (this.init instanceof DeclarationStatement) {
      let kind = this.init.kind;

      this.init.declarations.forEach((decl) =>{
        names[decl.name] = kind;
      });
    }

    return names;
  }
}
