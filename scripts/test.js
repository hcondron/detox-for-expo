var shell = require('shelljs');

shell.echo('\n#################################################################');
shell.echo('# cd test');
shell.cd('test');

shell.echo('\n#################################################################');
shell.echo('# npm run e2e (debug)');
if (shell.exec('npm run e2e').code !== 0) {
  shell.echo('error: npm run e2e');
  process.exit(1);
}

shell.echo('\n#################################################################');
shell.echo('# npm run e2e-release');
if (shell.exec('npm run e2e-release').code !== 0) {
  shell.echo('error: npm run e2e-release');
  process.exit(1);
}

shell.echo('\n');
