const mochaOptsContent= '--recursive --timeout 120000 --bail'
const firstTestContent = `describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should have welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
  });
  
  it('should show hello screen after tap', async () => {
    await element(by.id('hello_button')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });
  
  it('should show world screen after tap', async () => {
    await element(by.id('world_button')).tap();
    await expect(element(by.label('World!!!'))).toBeVisible();
  });
})`

exports.firstTest = firstTestContent
exports.runnerConfig = mochaOptsContent