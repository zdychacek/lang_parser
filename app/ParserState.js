/**
 * Represents parser state.
 */
export default class ParserState {
  constructor () {
    // state attributes default values
    this._defaults = {
      // if we are currently parsing function body
      inFunction: false,

      // if we are currently parsing switch case statements
      inLoop: false,

      // if we are currently parsing switch case statements
      inSwitchCaseBody: false,

      // if we are parsing for-in statement, than we must force "in" operator expressions to not eval
      allowIn: true
    };

    // state attributtes values are pushed to this stack
    this._stacks = {};
  }

  /**
   * Capture state attribute value.
   */
  pushAttribute (attribute, value) {
    // if we are pushing value for the first time, then we must create stack for this attribute at first
    if (!this._stacks[attribute]) {
      this._stacks[attribute] = [];
    }

    this._stacks[attribute].push(value);
  }

  /**
   * Resrtore state attribute value.
   */
  popAttribute (attribute) {
    var attrStack = this._stacks[attribute];

    // can't pop attribute value, if there is no value stored
    if (!attrStack || !attrStack.length) {
      throw new Error('Cannot pop state attribute.');;
    }

    return this._stacks[attribute].pop();
  }

  /**
   * Returns value of specified state attribute.
   */
  getAttribute (attribute) {
    var attrStack = this._stacks[attribute];

    if (attrStack) {
      let lastValue = attrStack[attrStack.length - 1];

      return lastValue !== undefined? lastValue : this._defaults[attribute];
    }

    return this._defaults[attribute];
  }
}
