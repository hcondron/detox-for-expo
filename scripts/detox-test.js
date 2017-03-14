#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const cp = require('child_process');
program
  .option('-r, --runner [runner]', 'Test runner (currently supports mocha)', 'mocha')
  .option('-c, --runner-config [config]', 'Test runner config file', 'mocha.opts')
  .option('-l, --loglevel [value]', 'info, debug, verbose, silly')
  .option('-d, --device [device name]', 'Run test on this device')
  .parse(process.argv);

const config = require(path.join(process.cwd(), 'package.json')).detox;
const testFolder = config.specs || 'e2e';

console.log('runner', program.runner);

const loglevel = program.loglevel ? `--loglevel ${program.loglevel}` : '';
const device = program.device ? `--device ${program.device}` : '';

let command;
switch (program.runner) {
  case 'mocha':
    command = `node_modules/.bin/${program.runner} ${testFolder} --opts ${testFolder}/${program.runnerConfig} ${device} ${loglevel}`;
    break;
  default:
    throw new Error(`${program.runner} is not supported in detox cli tools. You can still run your tests with the runner's own cli tool`);
}

console.log(command);
cp.execSync(command, {stdio: 'inherit'});
