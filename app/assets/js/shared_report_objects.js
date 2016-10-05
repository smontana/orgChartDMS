var sql = require('seriate')
var query_default = require('../../main-process/db/queries/default_queries.js')

module.exports = {
  get_all_solutions: function () {
    var solution_query = query_default.get_distinct_qpa_solutions

    sql.execute({
      query: solution_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var solution = s.Solution
        Solutions.push(solution)
      })
    }, function (err) {
      console.log(err)
    })
  },

  get_all_supervisors: function () {
    var supervisor_query = query_default.get_distinct_qpa_supervisors

    sql.execute({
      query: supervisor_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var supervisor = {
          solution: s.Solution,
          name: s.Supervisor,
          solution_supervisor: s.SolutionSupervisor
        }

        Supervisors.push(supervisor)
      })
    }, function (err) {
      console.log(err)
    })
  },

  get_all_agents: function () {
    var agent_query = query_default.get_distinct_qpa_agents

    sql.execute({
      query: agent_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var agent = s.Agent
        Agents.push(agent)
      })
    }, function (err) {
      console.log(err)
    })
  }
}
