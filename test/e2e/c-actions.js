describe('Actions', function () {

  beforeEach(function (done) {
    simulator.reloadReactNativeApp(done);
  });

  beforeEach(function () {
    element(by.label('Actions')).tap();
  });

  it('should tap on an element', function () {
    element(by.label('Tap Me')).tap();
    expect(element(by.label('Tap Working!!!'))).toBeVisible();
  });

  it('should long press on an element', function () {
    element(by.label('Tap Me')).longPress();
    expect(element(by.label('Long Press Working!!!'))).toBeVisible();
  });

  it('should multi tap on an element', function () {
    element(by.id('UniqueId819')).multiTap(3);
    expect(element(by.id('UniqueId819'))).toHaveLabel('Taps: 3');
  });

  // Backspace is supported by using "\b" in the string. Return key is supported with "\n"
  it('should type in an element', function () {
    element(by.id('UniqueId937')).typeText('passcode');
    expect(element(by.label('Type Working!!!'))).toBeVisible();
  });

  it('should clear text in an element', function () {
    element(by.id('UniqueId005')).clearText();
    expect(element(by.label('Clear Working!!!'))).toBeVisible();
  });

  // directions: 'up'/'down'/'left'/'right'
  it('should scroll for a small amount in direction', function () {
    expect(element(by.label('Text1'))).toBeVisible();
    expect(element(by.label('Text4'))).toBeNotVisible();
    element(by.id('ScrollView161')).scroll(100, 'down');
    expect(element(by.label('Text1'))).toBeNotVisible();
    expect(element(by.label('Text4'))).toBeVisible();
    element(by.id('ScrollView161')).scroll(100, 'up');
    expect(element(by.label('Text1'))).toBeVisible();
    expect(element(by.label('Text4'))).toBeNotVisible();
  });

  it('should scroll for a large amount in direction', function () {
    expect(element(by.label('Text6'))).toBeNotVisible();
    element(by.id('ScrollView161')).scroll(200, 'down');
    expect(element(by.label('Text6'))).toBeVisible();
  });

  // edges: 'top'/'bottom'/'left'/'right'
  it('should scroll to edge', function () {
    expect(element(by.label('Text8'))).toBeNotVisible();
    element(by.id('ScrollView161')).scrollTo('bottom');
    expect(element(by.label('Text8'))).toBeVisible();
    element(by.id('ScrollView161')).scrollTo('top');
    expect(element(by.label('Text1'))).toBeVisible();
  });

});
