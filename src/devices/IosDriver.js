const path = require('path');
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const DeviceDriverBase = require('./DeviceDriverBase');
const InvocationManager = require('../invoke').InvocationManager;
const invoke = require('../invoke');
const GREYConfiguration = require('./../ios/earlgreyapi/GREYConfiguration');
const argparse = require('../utils/argparse');

class IosDriver extends DeviceDriverBase {

  constructor(client) {
    super(client);

    const expect = require('../ios/expect');
    expect.exportGlobals();
    expect.setInvocationManager(new InvocationManager(client));
  }

  createPushNotificationJson(notification) {
    const notificationFilePath = path.join(__dirname, `detox`, `notifications`, `notification.json`);
    this.ensureDirectoryExistence(notificationFilePath);
    fs.writeFileSync(notificationFilePath, JSON.stringify(notification, null, 2));
    return notificationFilePath;
  }

  async sendUserNotification(notification) {
    const notificationFilePath = this.createPushNotificationJson(notification);
    await super.sendUserNotification({detoxUserNotificationDataURL: notificationFilePath});
  }

  async openURL(deviceId, params) {
    this.client.openURL(params);
  }

  async setURLBlacklist(urlList) {
    await this.client.execute(GREYConfiguration.setURLBlacklist(urlList));
  }

  async enableSynchronization() {
    await this.client.execute(GREYConfiguration.enableSynchronization());
  }

  async disableSynchronization() {
    await this.client.execute(GREYConfiguration.disableSynchronization());
  }

  async setOrientation(deviceId, orientation) {
    // keys are possible orientations
    const orientationMapping = {
      landscape: 3, // top at left side landscape
      portrait: 1  // non-reversed portrait
    };
    if (!Object.keys(orientationMapping).includes(orientation)) {
      throw new Error(`setOrientation failed: provided orientation ${orientation} is not part of supported orientations: ${Object.keys(orientationMapping)}`)
    }

    const call = invoke.call(invoke.EarlGrey.instance,
      'rotateDeviceToOrientation:errorOrNil:',
      invoke.IOS.NSInteger(orientationMapping[orientation])
    );
    await this.client.execute(call);
  }

  defaultLaunchArgsPrefix() {
    return '-';
  }

  validateDeviceConfig(config) {
    //no validation
  }

  getPlatform() {
    return 'ios';
  }
}

module.exports = IosDriver;
