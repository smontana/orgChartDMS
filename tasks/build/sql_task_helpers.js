require('dotenv').load()
var sql = require('seriate')
var _ = require('lodash')
var Q = require('q')
var env = process.env.ENV

var db_config = {
  name: 'default',
  user: process.env.DB_UN,
  password: process.env.DB_PW,
  host: process.env.DB_SERVER,
  database: process.env.DB_NAME
}

var default_queries = {
  get_distinct_qpa_solutions: 'EmployeeServices.dbo.get_distinct_QPA_solutions',
  get_distinct_qpa_supervisors: 'EmployeeServices.dbo.get_distinct_QPA_supervisors',
  get_distinct_qpa_agents: 'EmployeeServices.dbo.get_distinct_QPA_agents'
}

var Solutions_arr = []
var Supervisors_arr = []
var Agents_arr = []

var sql_data = {}

function set_default_config () {
  var deferred = Q.defer()
  var sql = require('seriate')

  console.log('------SETTING SQL DEFAULT CONFIG------')

  sql.setDefault(db_config)

  console.log('------SQL DEFAULT CONFIG SET------')
  deferred.resolve()
  return deferred.promise
}

function get_all_solutions (id) {
  var deferred = Q.defer()

  console.log('STEP 1: Getting Solutions')

  sql.execute({
    query: 'EmployeeServices.dbo.get_distinct_QPA_solutions'
  }).then(function (data) {
    Solutions_arr = data

    console.log('STEP 1: COMPLETED Solutions Query')
    deferred.resolve(1)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function get_all_supervisors (id) {
  var deferred = Q.defer()

  console.log('STEP 2: Getting Supervisors')

  sql.execute({
    query: 'EmployeeServices.dbo.get_distinct_QPA_supervisors'
  }).then(function (data) {
    Supervisors_arr = data

    console.log('STEP 2: COMPLETED Supervisors Query')
    deferred.resolve(2)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function get_all_agents (id) {
  var deferred = Q.defer()

  console.log('STEP 3: Getting Agents')

  sql.execute({
    query: 'EmployeeServices.dbo.get_distinct_QPA_agents'
  }).then(function (data) {
    Agents_arr = data

    console.log('STEP 3: COMPLETED Agents Query')
    deferred.resolve(3)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function build_sql_data_obj (id) {
  var deferred = Q.defer()
  console.log('STEP 4: Building sql_data Object')

  sql_data['Solutions'] = Solutions_arr
  sql_data['Supervisors'] = Supervisors_arr
  sql_data['Agents'] = Agents_arr

  console.log('STEP 4: COMPLETED Building sql_data Object')
  deferred.resolve(4)
  return deferred.promise
}

function console_log_this_shit (id) {
  var deferred = Q.defer()

  console.log('-----SQL_DATA: ' + JSON.stringify(sql_data, null, 3))

  deferred.resolve(5)
  return deferred.promise
}

function write_to_file (id) {
  var deferred = Q.defer()

  var jsonfile = require('jsonfile')
  var file_to_write = './tmp/data.json'

  jsonfile.writeFile(file_to_write, sql_data, {spaces: 2}, function (err) {
    console.error(err)
  })

  deferred.resolve(6)
  return deferred.promise
}

function export_the_goods (id) {
  var deferred = Q.defer()
  console.log('STEP 7: Exporting sql_data Object')

  module.exports = sql_data

  console.log('STEP 7: COMPLETED - sql_data Object Exported')
  deferred.resolve(7)
  return deferred.promise
}

function check_the_exported_goods (id) {
  var deferred = Q.defer()

  // console.log('MODULE.EXPORTS[Supervisors]: ' + module.exports['Supervisors'])
  console.log('-------DONE-------')

  deferred.resolve(8)
  return deferred.promise
}

var resultPromise = Q({})

resultPromise = resultPromise.then(function () {
  return set_default_config()
    .then(function (id) {
      return get_all_solutions(id)
    })
    .then(function (id) {
      return get_all_supervisors(id)
    })
    .then(function (id) {
      return get_all_agents(id)
    })
    .then(function (id) {
      return build_sql_data_obj(id)
    })
    .then(function (id) {
      return console_log_this_shit(id)
    })
    .then(function (id) {
      return write_to_file(id)
    })
    .then(function (id) {
      return export_the_goods(id)
    })
    .then(function (id) {
      return check_the_exported_goods(id)
    })
})
