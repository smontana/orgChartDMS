var sql = require('seriate')
var _ = require('lodash')
var Q = require('q')

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

var completeOrg;
var managers_arr = [];
var supervisors_arr = [];
var agents_arr = [];

function org_obj (org, mgrs, supes, agents) {
  this.parentOrg = org;
  this.mgrOrg = mgrs;
  this.supeOrg = supes;
  this.agentOrg = agents;
}

function director (id, name, role, mgr_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.className = 'director-level';
  this.children = mgr_arr;
  this.relationship = '001';
}

function manager (id, name, role, mgr_id, supe_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'mgr-level';
  this.children = supe_arr;
  this.relationship = '111';
}

function supervisor (id, name, role, mgr_id, agent_arr) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'supe-level';
  this.children = agent_arr;
  this.relationship = '111';
}

function agent (id, name, role, mgr_id) {
  this.id = id;
  this.name = name;
  this.title = role;
  this.mgr_id = mgr_id;
  this.className = 'agent-level';
  this.relationship = '110';
}

function get_direct_reports (emp_id, grouped_arr) {
  return grouped_arr[emp_id];
}

// --------------------------------------------------------------------

var get_all_agents = function () {
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

    console.log('STEP 1: COMPLETED Agents Query');
  }, function (err) {
    console.log(err)
  })
}

var get_all_supervisors = function () {
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

    console.log('STEP 2: COMPLETED Supervisors Query');
  }, function (err) {
    console.log(err)
  })
}

var get_all_managers = function () {
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

    console.log('STEP 3: COMPLETED Managers Query');
  }, function (err) {
    console.log(err)
  })
}

var get_director = function () {
  var cs_director = [];
  sql.execute({
    query: 'DMSOrgChart.dbo.get_current_director'
  }).then(function (data) {

    _.forEach(data, function(obj) {
      var id = obj.EMPID;
      var reports_arr = new get_direct_reports(id, managers_arr);
      var boss = new director(id, obj.EMPFullName, obj.EMPRoleID, reports_arr);
      cs_director.push(boss);
    })

    // completeOrg = cs_director[0];

    module.exports = cs_director[0];

    console.log('STEP 4: COMPLETED Director Query');
  }, function (err) {
    console.log(err)
  })
}

var build_export = function () {

  var orgObj = new org_obj(completeOrg, managers_arr, supervisors_arr, agents_arr);

  console.log('orgObj: ' + orgObj);
  return orgObj;
}

var return_data = function () {
  return completeOrg;
}

// --------------------------------------------------------------------

Q.fcall(get_all_agents)
.then(get_all_supervisors)
.then(get_all_managers)
.then(get_director)
.catch(function (error) {
  console.error('ERROR: ', error)
})
.done();

// module.exports = return_data;
