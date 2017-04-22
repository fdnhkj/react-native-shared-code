#!/usr/bin/env node

const fs = require('fs');
const sep = require('path').sep;
const child_process = require('child_process');
const argv = require('minimist')(process.argv.slice(2));

/**
 * # Gets bundle dependencies using RN packager.
 * @param {string} platform Platform for which the bundle is built. Accepted values are 'ios' and 'android'.
 */
function getBundleDependencies(rnDirectoryPath, platform) {
  return child_process
    .execSync(
      `react-native dependencies --entry-file index.${platform}.js --platform ${platform} ${argv.verbose ? '--verbose' : ''}`, {
        cwd: rnDirectoryPath,
        shell: '/bin/bash'
    })
    .toString()
    .replace(/ /g, '\\ ');
}

function filterDependencies(dependencies) {
  return dependencies
    .split('\n')
    .filter(dependency => !/__mocks__|__tests__|node_modules/.test(dependency) && dependency.endsWith('.js'))
    .join('\n');
}

function getPlatformJsLOC(platform, dependencies) {
  const platformJSDependencies = dependencies
    .split('\n')
    .filter(dependency => dependency.endsWith(`.${platform}.js`))
    .join('\n');

  return Number(
    child_process
      .execSync(`echo "${platformJSDependencies}" | xargs cat | wc -l`, {shell: '/bin/bash'})
      .toString()
      .trim()
  );
}

function getJsDependencies(platform, dependencies) {
  return dependencies
    .split('\n')
    .filter(dependency => !dependency.endsWith(`.${platform}.js`))
    .join('\n');
}

function getJsLOC(jsDependencies) {
  return Number(
    child_process
      .execSync(`echo "${jsDependencies}" | xargs cat | wc -l`, {shell: '/bin/bash'})
      .toString()
      .trim()
  );
}

function getPlatformModuleLOC(jsDependencies) {
  return Number(
    child_process
      .execSync(`echo "${jsDependencies}" | xargs node ${__dirname}/find-platform-module-LOC.js`, {shell: '/bin/bash'})
      .toString()
      .trim()
  );
}

function calculate(rnDirectoryPath, platform) {
  const dependencies = getBundleDependencies(rnDirectoryPath, platform);
  const filteredDependencies = filterDependencies(dependencies);
  
  const platformJsLOC = getPlatformJsLOC(platform, filteredDependencies);

  const jsDependencies = getJsDependencies(platform, filteredDependencies);
  const platformModuleLOC = getPlatformModuleLOC(jsDependencies);
  const sharedJsLOC = getJsLOC(jsDependencies) - platformModuleLOC;

  const totalLOC = platformJsLOC + sharedJsLOC + platformModuleLOC;
  const platformPercentage = ((platformJsLOC + platformModuleLOC) / totalLOC) * 100;
  
  const sharedPercentage = (sharedJsLOC / totalLOC) * 100;
  
  console.log(`For the ${platform} bundle, you used`);
  console.log(`  ${platformPercentage.toFixed(2)} % platform-specific code (${platformJsLOC + platformModuleLOC} LOC)`);
  console.log(`  ${sharedPercentage.toFixed(2)} % shared code (${sharedJsLOC} LOC)`)
  console.log('');
}

function handleHelp() {
    if (argv._.length === 0 && (argv.h || argv.help)) {
    console.log([
      '',
      '  Usage: react-native-shared-code [path] [options]',
      '',
      '',
      '  Commands:',
      '',
      '    [path]     path to React Native project (default value is cwd)',
      '',
      '  Options:',
      '',
      '    -h, --help    output usage information',
      '    -v, --version output the version number',
      '    -p, --platform platform for which to calculate the shared code percentages.',
      '                   Accepted values are ios, android and windows.',
      '                   By default, it detects index.platform.js for android, ios, windows',
      '    --verbose output debugging info',
      '',
    ].join('\n'));
    process.exit(0);
  }
}

function handleVersion() {
  if (argv._.length === 0 && (argv.v || argv.version)) {
    console.log(require('./package.json').version);
    process.exit(0);
  }
}

function verifyPathIntegrity(path) {
  if (!fs.existsSync(path)) {
    console.error(`Provided path (${path}) does not exist. It should be the path to the React Native project.`);
    process.exit(1);
  } else {
    if (!fs.lstatSync(path).isDirectory()) {
      console.error(`Provided path (${path}) is not a directory. It should be the path to the React Native project.`);
      process.exit(1);
    }
  }
}

function verifyPlatformIntegrity(platform) {
  if (!/^(android|ios|windows)$/i.test(platform)) {
    console.error(`Provided platform ${platform} is not valid. Accepted platforms are android, ios, windows.`);
    process.exit(1);
  }
}

function main() {
  handleHelp();
  handleVersion();
  const defaults = {
    path: '.',
    platform: ['android', 'ios', 'windows'],
  }

  const path = argv._[0] ? argv._[0] : defaults.path;
  verifyPathIntegrity(path);
  
  let platforms = (argv.p || argv.platform) ? (argv.p || argv.platform) : defaults.platform;
  if (!Array.isArray(platforms)) {
    platforms = [platforms];
  }
  platforms.forEach(platform => verifyPlatformIntegrity(platform));

  let platformDetected = false;
  platforms.forEach((platform, index, array) => {
    if (fs.existsSync(path + sep + `index.${platform}.js`)) {
      if (!platformDetected) {
        platformDetected = true;
      }
      calculate(path, platform);
    } else {
      if (index === array.length - 1 && !platformDetected) {
        console.warn(`No index.platform.js (${array.join(',')}) found in ${process.cwd()}`);
      }
    }
  });
}
main();
