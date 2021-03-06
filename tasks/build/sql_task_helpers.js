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
  get_managers: 'DMSOrgChart.dbo.get_current_mgrs',
  get_supervisors: 'DMSOrgChart.dbo.get_current_supes',
  get_agents: 'DMSOrgChart.dbo.get_current_agents',
  // -----------------------
  get_director: 'DMSOrgChart.dbo.get_current_director',
  get_workgroups: 'DMSOrgChart.dbo.get_current_workgroups',
  // -----------------------
  get_current_mgr_accting: 'DMSOrgChart.dbo.get_current_mgr_accting',
  get_current_mgr_business_office: 'DMSOrgChart.dbo.get_current_mgr_business_office',
  get_current_mgr_fixed_ops: 'DMSOrgChart.dbo.get_current_mgr_fixed_ops',
  get_current_mgr_sys_admin: 'DMSOrgChart.dbo.get_current_mgr_sys_admin',
  get_current_supes_accting: 'DMSOrgChart.dbo.get_current_supes_accting',
  get_current_supes_business_office: 'DMSOrgChart.dbo.get_current_supes_business_office',
  get_current_supes_fixed_ops: 'DMSOrgChart.dbo.get_current_supes_fixed_ops',
  get_current_supes_sys_admin: 'DMSOrgChart.dbo.get_current_supes_sys_admin'
}

var director_obj = {};
var workgroups_arr = [];
var managers_arr = [];
var managers_hierarchy_arr = [];
var supervisors_arr = [];
var supervisors_hierarchy_arr = [];
var agents_arr = [];
var agents_hierarchy_arr = [];
var sql_data;

function director (id, name, role, mgr_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.className = 'director-level';
  this.children = mgr_arr;
}

function manager (id, name, role, mgr_id, supe_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'mgr-level';
  this.children = supe_arr;
}

function supervisor (id, name, role, mgr_id, agent_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'supe-level';
  this.children = agent_arr;
}

function agent (id, name, role, mgr_id) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'agent-level';
}

function get_direct_reports (emp_id, grouped_arr) {
  return grouped_arr[emp_id];
}

function set_default_config () {
  var deferred = Q.defer()
  var sql = require('seriate')
  sql.setDefault(db_config)
  deferred.resolve()
  return deferred.promise
}

// --------------------------------------------------------------------

function get_all_agents (id) {
  var deferred = Q.defer()

  sql.execute({
    query: 'DMSOrgChart.dbo.get_current_agents'
  }).then(function (data) {
    var agent_org_objs = [];

    _.forEach(data, function(obj) {
      var tm = new agent(obj.EMPID, obj.EMPFullName, obj.EMPRoleID, obj.EMPManager_id);
      agent_org_objs.push(tm);
    })

    var groupedAgents = _.groupBy(agent_org_objs, function(n) {
      return n.mgr_id;
    });

    agents_arr = groupedAgents;

    console.log('STEP 1: COMPLETED Agents Query')
    deferred.resolve(1)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function get_all_supervisors (id) {
  var deferred = Q.defer()

  sql.execute({
    query: 'DMSOrgChart.dbo.get_current_supes'
  }).then(function (data) {
    var supe_org_objs = [];

    _.forEach(data, function(obj) {
      var id = obj.EMPID;
      var reports_arr = new get_direct_reports(id, agents_arr);
      var supe = new supervisor(id, obj.EMPFullName, obj.EMPRoleID, obj.EMPManager_id, reports_arr);

      supe_org_objs.push(supe);
    })

    var groupedSupes = _.groupBy(supe_org_objs, function(n) {
      return n.mgr_id;
    });

    supervisors_arr = groupedSupes;

    console.log('STEP 2: COMPLETED Supervisors Query')
    deferred.resolve(2)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function get_all_managers (id) {
  var deferred = Q.defer()

  sql.execute({
    query: 'DMSOrgChart.dbo.get_current_mgrs'
  }).then(function (data) {
    var mgr_org_objs = [];

    _.forEach(data, function(obj) {
      var id = obj.EMPID;
      var reports_arr = new get_direct_reports(id, supervisors_arr);
      var mgr = new manager(id, obj.EMPFullName, obj.EMPRoleID, obj.EMPManager_id, reports_arr);

      mgr_org_objs.push(mgr);
    })

    var groupedMgrs = _.groupBy(mgr_org_objs, function(n) {
      return n.mgr_id;
    });

    managers_arr = groupedMgrs;

    console.log('STEP 3: COMPLETED Managers Query')
    deferred.resolve(3)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

function get_director (id) {
  var deferred = Q.defer()

  sql.execute({
    query: 'DMSOrgChart.dbo.get_current_director'
  }).then(function (data) {

    _.forEach(data, function(obj) {
      var id = obj.EMPID;
      var reports_arr = new get_direct_reports(id, managers_arr);
      var boss = new director(id, obj.EMPFullName, obj.EMPRoleID, reports_arr);

      sql_data = boss;
    })

    console.log('STEP 4: COMPLETED Director Query')
    deferred.resolve(4)
  }, function (err) {
    console.log(err)
  })

  return deferred.promise
}

// --------------------------------------------------------------------

function console_log_this_shit (id) {
  var deferred = Q.defer()

  // console.log('-----SQL_DATA: ' + JSON.stringify(sql_data, null, 3))

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

  console.log('STEP 6: COMPLETED - sql_data written to tmp/data.json file')
  deferred.resolve(6)
  return deferred.promise
}

function export_the_goods (id) {
  var deferred = Q.defer()

  module.exports = sql_data

  console.log('STEP 7: COMPLETED - sql_data Object Exported')
  deferred.resolve(7)
  return deferred.promise
}

function check_the_exported_goods (id) {
  var deferred = Q.defer()

  // console.log('SQL_DATA: ' + JSON.stringify(sql_data, null, 3))
  console.log('-------DONE-------')

  deferred.resolve(8)
  return deferred.promise
}

// --------------------------------------------------------------------

var resultPromise = Q({})

resultPromise = resultPromise.then(function () {
  return set_default_config()
    .then(function (id) {
      return get_all_agents(id)
    })
    .then(function (id) {
      return get_all_supervisors(id)
    })
    .then(function (id) {
      return get_all_managers(id)
    })
    .then(function (id) {
      return get_director(id)
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
