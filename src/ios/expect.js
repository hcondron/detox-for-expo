const invoke = require('../invoke');

//// examples

/*

element(by.label('Click Me')).tap();
[[EarlGrey selectElementWithMatcher:grey_accessibilityLabel(@"Click Me")] performAction:grey_tap()];
const _getMatcher1 = detox.invoke.call(detox.invoke.IOS.Class('GREYMatchers'), 'matcherForAccessibilityLabel:', 'Click Me');
const _getElement1 = detox.invoke.call(detox.invoke.EarlGrey.instance, 'selectElementWithMatcher:', _getMatcher1);
const _getAction1 = detox.invoke.call(detox.invoke.IOS.Class('GREYActions'), 'actionForTap');
const _getInteraction1 = detox.invoke.call(_getElement1, 'performAction:', _getAction1);
detox.invoke.execute(_getInteraction1);

expect(element(by.label('Yay'))).toBeVisible();
[[EarlGrey selectElementWithMatcher:grey_accessibilityLabel(@"Yay")] assertWithMatcher:grey_sufficientlyVisible()];
const _getMatcher2 = detox.invoke.call(detox.invoke.IOS.Class('GREYMatchers'), 'matcherForAccessibilityLabel:', 'Yay');
const _getElement2 = detox.invoke.call(detox.invoke.EarlGrey.instance, 'selectElementWithMatcher:', _getMatcher2);
const _getAssertMatcher2 = detox.invoke.call(detox.invoke.IOS.Class('GREYMatchers'), 'matcherForSufficientlyVisible');
const _getInteraction2 = detox.invoke.call(_getElement2, 'assertWithMatcher:', _getAssertMatcher2);
detox.invoke.execute(_getInteraction2);

*/

//// classes

class Matcher {}

class LabelMatcher extends Matcher {
  constructor(value) {
    super();
    if (typeof value !== 'string') throw new Error(`LabelMatcher ctor argument must be a string, got ${typeof value}`);
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForAccessibilityLabel:', value);
  }
}

class IdMatcher extends Matcher {
  constructor(value) {
    super();
    if (typeof value !== 'string') throw new Error(`IdMatcher ctor argument must be a string, got ${typeof value}`);
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForAccessibilityID:', value);
  }
}

class VisibleMatcher extends Matcher {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForSufficientlyVisible');
  }
}

class NotVisibleMatcher extends Matcher {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForNotVisible');
  }
}

class ExistsMatcher extends Matcher {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForNotNil');
  }
}

class NotExistsMatcher extends Matcher {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'matcherForNil');
  }
}

class TextMatcher extends Matcher {
  constructor(value) {
    super();
    if (typeof value !== 'string') throw new Error(`TextMatcher ctor argument must be a string, got ${typeof value}`);
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'detoxMatcherForText:', value);
  }
}

class ExtendedScrollMatcher extends Matcher {
  constructor(matcher) {
    super();
    if (!matcher instanceof Matcher) throw new Error(`ExtendedScrollMatcher ctor argument must be a valid Matcher, got ${typeof matcher}`);
    this._call = invoke.call(invoke.IOS.Class('GREYMatchers'), 'detoxMatcherForScrollChildOfMatcher:', matcher._call);
  }
}

class Action {}

class TapAction extends Action {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForTap');
  }
}

class LongPressAction extends Action {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForLongPress');
  }
}

class MultiTapAction extends Action {
  constructor(value) {
    super();
    if (typeof value !== 'number') throw new Error(`MultiTapAction ctor argument must be a number, got ${typeof value}`);
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForMultipleTapsWithCount:', invoke.IOS.NSInteger(value));
  }
}

class TypeTextAction extends Action {
  constructor(value) {
    super();
    if (typeof value !== 'string') throw new Error(`TypeTextAction ctor argument must be a string, got ${typeof value}`);
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForTypeText:', value);
  }
}

class ClearTextAction extends Action {
  constructor() {
    super();
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForClearText');
  }
}

class ScrollAmountAction extends Action {
  constructor(direction, amount) {
    super();
    if (typeof direction !== 'string') throw new Error(`ScrollAmountAction ctor 1st argument must be a string, got ${typeof direction}`);
    switch (direction) {
      case 'left': direction = 1; break;
      case 'right': direction = 2; break;
      case 'up': direction = 3; break;
      case 'down': direction = 4; break;
      default: throw new Error(`ScrollAmountAction direction must be a 'left'/'right'/'up'/'down', got ${direction}`);
    }
    if (typeof amount !== 'number') throw new Error(`ScrollAmountAction ctor 2nd argument must be a number, got ${typeof amount}`);
    this._call = invoke.call(invoke.IOS.Class('GREYActions'), 'actionForScrollInDirection:amount:', invoke.IOS.NSInteger(direction), invoke.IOS.CGFloat(amount));
  }
}

class Interaction {
  execute() {
    if (!this._call) throw new Error(`Interaction.execute cannot find a valid _call, got ${typeof this._call}`);
    invoke.execute(this._call);
  }
}

class ActionInteraction extends Interaction {
  constructor(element, action) {
    super();
    if (!element instanceof Element) throw new Error(`ActionInteraction ctor argument must be a valid Element, got ${typeof element}`);
    if (!action instanceof Action) throw new Error(`ActionInteraction ctor argument must be a valid Action, got ${typeof action}`);
    this._call = invoke.call(element._call, 'performAction:', action._call);
  }
}

class MatcherAssertionInteraction extends Interaction {
  constructor(element, matcher) {
    super();
    if (!element instanceof Element) throw new Error(`MatcherAssertionInteraction ctor argument must be a valid Element, got ${typeof element}`);
    if (!matcher instanceof Matcher) throw new Error(`MatcherAssertionInteraction ctor argument must be a valid Matcher, got ${typeof matcher}`);
    this._call = invoke.call(element._call, 'assertWithMatcher:', matcher._call);
  }
}

class Element {
  constructor(matcher) {
    this._originalMatcher = matcher;
    this._selectElementWithMatcher(this._originalMatcher);
  }
  _selectElementWithMatcher(matcher) {
    if (!matcher instanceof Matcher) throw new Error(`Element _selectElementWithMatcher argument must be a valid Matcher, got ${typeof matcher}`);
    this._call = invoke.call(invoke.EarlGrey.instance, 'selectElementWithMatcher:', matcher._call);
  }
  tap() {
    return new ActionInteraction(this, new TapAction()).execute();
  }
  longPress() {
    return new ActionInteraction(this, new LongPressAction()).execute();
  }
  multiTap(value) {
    return new ActionInteraction(this, new MultiTapAction(value)).execute();
  }
  typeText(value) {
    return new ActionInteraction(this, new TypeTextAction(value)).execute();
  }
  clearText() {
    return new ActionInteraction(this, new ClearTextAction()).execute();
  }
  scroll(amount, direction = 'down') {
    // override the user's element selection with an extended matcher that looks for UIScrollView children
    this._selectElementWithMatcher(new ExtendedScrollMatcher(this._originalMatcher));
    return new ActionInteraction(this, new ScrollAmountAction(direction, amount)).execute();
  }
}

class Expect {}

class ExpectElement extends Expect {
  constructor(element) {
    super();
    if (!element instanceof Element) throw new Error(`ExpectElement ctor argument must be a valid Element, got ${typeof element}`);
    this._object = element;
  }
  toBeVisible() {
    return new MatcherAssertionInteraction(this._object, new VisibleMatcher()).execute();
  }
  toBeNotVisible() {
    return new MatcherAssertionInteraction(this._object, new NotVisibleMatcher()).execute();
  }
  toExist() {
    return new MatcherAssertionInteraction(this._object, new ExistsMatcher()).execute();
  }
  toNotExist() {
    return new MatcherAssertionInteraction(this._object, new NotExistsMatcher()).execute();
  }
  toHaveText(value) {
    return new MatcherAssertionInteraction(this._object, new TextMatcher(value)).execute();
  }
  toHaveLabel(value) {
    return new MatcherAssertionInteraction(this._object, new LabelMatcher(value)).execute();
  }
  toHaveId(value) {
    return new MatcherAssertionInteraction(this._object, new IdMatcher(value)).execute();
  }
}

//// syntax

function expect(object) {
  if (object instanceof Element) return new ExpectElement(object);
  throw new Error(`expect() argument is invalid, got ${typeof object}`);
}

function element(matcher) {
  return new Element(matcher);
}

const by = {
  label: (value) => new LabelMatcher(value),
  id: (value) => new IdMatcher(value)
};

const exportGlobals = function () {
  global.element = element;
  global.expect = expect;
  global.by = by;
};

export {
  exportGlobals,
  expect,
  element,
  by
};
