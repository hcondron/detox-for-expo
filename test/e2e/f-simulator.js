describe('Simulator', () => {
  it('reloadReactNative - should tap successfully', async () => {
    await device.reloadReactNative();
    await element(by.label('Sanity')).tap();
    await element(by.label('Say Hello')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });

  it('relaunchApp - should tap successfully', async () => {
    await device.relaunchApp();
    await element(by.label('Sanity')).tap();
    await element(by.label('Say Hello')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });

  it('relaunchApp({delete: true}) - should tap successfully', async () => {
    await device.relaunchApp({delete: true});
    await element(by.label('Sanity')).tap();
    await element(by.label('Say Hello')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });

  it('uninstall() + install() + relaunch() - should tap successfully', async () => {
    await device.uninstallApp();
    await device.installApp();
    await device.relaunchApp();
    await element(by.label('Sanity')).tap();
    await element(by.label('Say Hello')).tap();
    await expect(element(by.label('Hello!!!'))).toBeVisible();
  });

  describe('device orientation', () => {
    beforeEach(async() => {
      await device.reloadReactNative();
      await element(by.label('Orientation')).tap();

      // Check if the element whichs input we will test actually exists
      await expect(element(by.id('currentOrientation'))).toExist();
    });

    it('OrientationLandscape', async () => {
      await device.setOrientation('landscape');

      await expect(element(by.id('currentOrientation'))).toHaveText('Landscape');
    });

    it('OrientationPortrait', async() => {
      // As default is portrait we need to set it otherwise
      await device.setOrientation('landscape');
      await device.setOrientation('portrait');

      await expect(element(by.id('currentOrientation'))).toHaveText('Portrait');
    });
  });
});
