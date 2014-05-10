import Statement from './Statement';
import DeclarationStatement from './DeclarationStatement';

export default class ForInStatement extends Statement {
  constructor (left, right, body) {
    super('ForInStatement');

    this.left = left;
    this.right = right;
    this.body = body;
  }

  get declarations () {
    var names = {};

    if (this.left instanceof DeclarationStatement) {
      let kind = this.left.kind;

      this.left.declarations.forEach((decl) =>{
        names[decl.name] = kind;
      });
    }

    return names;
  }

  eval (context) {

  }
}
