describe('IOS simulator driver', () => {
  let uut, sim;

  const deviceId = 'device-id-mock';
  const bundleId = 'bundle-id-mock';

  beforeEach(() => {
    jest.mock('../ios/AppleSimUtils', () => mockAppleSimUtils);
  });

  describe('launch args', () => {
    let launchArgs, languageAndLocale;

    beforeEach(() => {
      launchArgs = {
        'dog1': 'dharma',
        'dog2': 'karma',
      };

      languageAndLocale = '';

      const SimulatorDriver = require('./SimulatorDriver');
      uut = new SimulatorDriver({ client: {} });
    });

    it('should be passed to AppleSimUtils', async () => {
      await uut.launchApp(deviceId, bundleId, launchArgs, languageAndLocale);
      expect(uut.applesimutils.launch).toHaveBeenCalledWith(deviceId, bundleId, launchArgs, languageAndLocale);
    });

    it('should be passed to AppleSimUtils even if some of them were received from `beforeLaunchApp` phase', async () => {
      uut.emitter.on('beforeLaunchApp', ({ launchArgs }) => {
        launchArgs.dog3 = 'Chika, from plugin';
      });

      await uut.launchApp(deviceId, bundleId, launchArgs, languageAndLocale);
      expect(uut.applesimutils.launch).toHaveBeenCalledWith(deviceId, bundleId, {
        ...launchArgs,
        dog3: 'Chika, from plugin',
      }, '');
    });
  });

  describe('biometrics', () => {
    beforeEach(() => {
      languageAndLocale = '';

      const SimulatorDriver = require('./SimulatorDriver');
      sim = new SimulatorDriver({ client: {} });
    });

    it('enrolls in biometrics by passing to AppleSimUtils', async () => {
      await sim.setBiometricEnrollment(deviceId, 'YES');
      expect(sim.applesimutils.setBiometricEnrollment).toHaveBeenCalledWith(deviceId, 'YES');
    });

    it('disenrolls in biometrics by passing to AppleSimUtils', async () => {
      await sim.setBiometricEnrollment(deviceId, 'NO');
      expect(sim.applesimutils.setBiometricEnrollment).toHaveBeenCalledWith(deviceId, 'NO');
    });

    it('matches a face by passing to AppleSimUtils', async () => {
      await sim.matchFace(deviceId);
      expect(sim.applesimutils.matchBiometric).toHaveBeenCalledWith(deviceId, 'Face');
    });

    it('fails to match a face by passing to AppleSimUtils', async () => {
      await sim.unmatchFace(deviceId);
      expect(sim.applesimutils.unmatchBiometric).toHaveBeenCalledWith(deviceId, 'Face');
    });

    it('matches a face by passing to AppleSimUtils', async () => {
      await sim.matchFinger(deviceId);
      expect(sim.applesimutils.matchBiometric).toHaveBeenCalledWith(deviceId, 'Finger');
    });

    it('fails to match a face by passing to AppleSimUtils', async () => {
      await sim.unmatchFinger(deviceId);
      expect(sim.applesimutils.unmatchBiometric).toHaveBeenCalledWith(deviceId, 'Finger');
    })
  });

  describe('acquireFreeDevice', () => {
    let applesimutils;

    beforeEach(() => {
      const SimulatorDriver = require('./SimulatorDriver');
      uut = new SimulatorDriver({ client: {} });
      jest.spyOn(uut.deviceRegistry, 'isDeviceBusy').mockReturnValue(false);
      applesimutils = uut.applesimutils;
      applesimutils.list.mockImplementation(async () => require('../ios/applesimutils.mock')['--list']);
    });

    it('should accept string as device type', async () => {
      await uut.acquireFreeDevice('iPhone X');

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byType: 'iPhone X' },
        'Searching for device by type = "iPhone X" ...'
      );
    });

    it('should accept string with comma as device type and OS version', async () => {
      await uut.acquireFreeDevice('iPhone X, iOS 12.0');

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byType: 'iPhone X', byOS: 'iOS 12.0' },
        'Searching for device by type = "iPhone X" and by OS = "iOS 12.0" ...'
      );
    });

    it('should accept { byId } as matcher', async () => {
      await uut.acquireFreeDevice({ id: 'C6EC2279-A6EB-40BE-99D2-5F11949F25E5' });

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byId: 'C6EC2279-A6EB-40BE-99D2-5F11949F25E5' },
        'Searching for device by UDID = "C6EC2279-A6EB-40BE-99D2-5F11949F25E5" ...'
      );
    });

    it('should accept { byName } as matcher', async () => {
      await uut.acquireFreeDevice({ name: 'Chika' });

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byName: 'Chika' },
        'Searching for device by name = "Chika" ...'
      );
    });

    it('should accept { byType } as matcher', async () => {
      await uut.acquireFreeDevice({ type: 'iPad Air' });

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byType: 'iPad Air' },
        'Searching for device by type = "iPad Air" ...'
      );
    });

    it('should accept { byType, byOS } as matcher', async () => {
      await uut.acquireFreeDevice({ type: 'iPad 2', os: 'iOS 9.3.6' });

      expect(applesimutils.list).toHaveBeenCalledWith(
        { byType: 'iPad 2', byOS: 'iOS 9.3.6' },
        'Searching for device by type = "iPad 2" and by OS = "iOS 9.3.6" ...'
      );
    });
  });
});

class mockAppleSimUtils {
  constructor() {
    this.launch = jest.fn();
    this.setBiometricEnrollment = jest.fn();
    this.matchBiometric = jest.fn();
    this.unmatchBiometric = jest.fn();
    this.boot = jest.fn();
    this.list = jest.fn();
  }
}
