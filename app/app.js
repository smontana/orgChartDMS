import os from 'os' // native node.js module
import { remote } from 'electron' // native electron module
import jetpack from 'fs-jetpack' // module loaded from npm

import env from './env'
console.log('Loaded environment variables:', env)

import sql from 'seriate'

const db_config = {
  name: 'default',
  user: env.DB_UN,
  password: env.DB_PW,
  host: env.DB_SERVER,
  database: env.DB_NAME
}

sql.setDefault(db_config)

global.connection = db_config
console.log('global.connection: ', global.connection)

var app = remote.app
var appDir = jetpack.cwd(app.getAppPath())
// console.log('The author of this app is:', appDir.read('package.json', 'json').author)

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM Content Loaded!')
})
