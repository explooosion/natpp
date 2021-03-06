#!/usr/bin/env node

'use strict'

const {
  exec
} = require('child_process')
const program = require('commander')
const chalk = require('chalk')
const ws = require('windows-shortcuts')
const favicon = require('favicon')
const pkg = require('./package.json')
const fs = require('fs')
const path = require('path')
const os = require('os')

let payload = {
  url: 'https://github.com/',
  name: 'natpp',
  width: 800,
  height: 600,
  desc: 'a native web app',
  icon: '',
}

program
  .version(pkg.version)
  .usage('[options] <args ...>')
  .option('-v, --version [value]', 'Show app version')
  .option('-n, --name [value]', 'Set app name', setName)
  .option('-w, --width [value]', 'Set app width', setWidth)
  .option('-h, --height [value]', 'Set app height', setHeight)
  .option('-d, --desc [value]', 'Set app description', setDesc)
  .parse(process.argv)

if (program.args.length === 0) {
  program.outputHelp(
    () => {
      return chalk.white(`
      Natpp ${pkg.version}

      Usage
        $ natpp <url>
        $ natpp -v

      Options
        -n, --name    [value],  Set app name (default: web hostname)
        -w, --width   [value],  Set app width (default: 800)
        -h, --height  [value],  Set app height (default: 600)
        -d, --desc    [value],  Set app description

      Examples
        $ natpp https://example.com/ 
        $ natpp https://example.com/ -n myapp 
        $ natpp https://example.com/ -n myapp -w 100 
        $ natpp https://example.com/ -h 200 
        $ natpp https://example.com/ -d "this is my app"  
    `)
    })
  return
}

// ===========================================
// Cmder Start
// ===========================================

// Check natpp is build

const _os = os.arch() === 'x64' ? 'x64' : 'ia32'

if (!fs.existsSync(`${path.resolve(__dirname, `natpp-win32-${_os}`)}`)) {

  console.log(chalk.yellow('Build'), 'the native app (only first time)')

  const cmd = os.arch() === 'x64' ? 'npm run build:64' : 'npm run build:32'

  exec(cmd, {
    cwd: `${__dirname}`
  }, (err, stdout, stderr) => {
    if (err) throw Error(err)
    createLnk()
  })
} else {
  createLnk()
}

function createLnk() {

  // Check url
  if (!program.args[0].includes('http')) {
    console.log(chalk.red('error:'), `unknow url ${program.args[0]}`)
    return
  }

  // Parse args
  setUrl(program.args[0])

  console.log(chalk.yellow('Create link ...'))

  console.log('-')
  console.log(chalk.blue('url -'), payload.url)

  // Set app name
  if (payload.name === 'natpp') {
    payload.name = getHostName(payload.url)
  }

  console.log(chalk.blue('name -'), payload.name)
  console.log(chalk.blue('width -'), payload.width)
  console.log(chalk.blue('height -'), payload.height)
  console.log(chalk.blue('description -'), payload.desc)

  // Get favicon
  favicon(payload.url, (err, icon) => {
    if (err) throw Error(err)
    payload.icon = icon.includes('.ico') ? icon : ''
    console.log(chalk.blue('icon -'), payload.icon === '' ? 'use default' : payload.icon)
    console.log('-')

    // Create windows link
    ws.create(`%UserProfile%/DeskTop/${payload.name}.lnk`, {
      target: `${__dirname}/natpp-win32-${_os}/natpp.exe`,
      args: `url=${payload.url} w=${payload.width} h=${payload.height}`,
      desc: payload.desc,
      icon: payload.icon,
    }, (err) => {
      if (err) throw Error(err)
      console.log(chalk.green(`Success ✔️`))
    })
  })
}

// ===========================================
// Functions
// ===========================================

/**
 * Set app url
 * @param {string} val url
 */
function setUrl(val) {
  payload.url = val
}

/**
 * Set app name
 * @param {string} val name
 */
function setName(val) {
  payload.name = val
}

/**
 * Set app width
 * @param {number} val width
 */
function setWidth(val) {
  payload.width = Number(val)
}

/**
 * Set app height
 * @param {number} val height
 */
function setHeight(val) {
  payload.height = Number(val)
}

/**
 * Set app description
 * @param {string} val desc
 */
function setDesc(val) {
  payload.desc = val
}

/**
 * Get web hostname
 * @param {string} url web url
 * @return {string}
 */
function getHostName(url) {
  const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (
    match != null &&
    match.length > 2 &&
    typeof match[2] === 'string' &&
    match[2].length > 0
  ) {
    return match[2];
  } else {
    return null;
  }
}