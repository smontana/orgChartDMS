var sql = require('seriate')
var _ = require('lodash')
var query_default = require('../../main-process/db/queries/default_queries.js')

module.exports = {
  get_active_director: function () {
    var director_query = query_default.get_active_director

    sql.execute({
      query: director_query
    }).then(function (data) {
      console.log(data)
      var data = data[0];

      return data;

    }, function (err) {
      console.log(err)
    })
  },

  get_distinct_mgrs: function () {
    var mgr_query = query_default.get_distinct_mgrs
    var mgrs = []

    sql.execute({
      query: mgr_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var mgr = {
          id: s.id,
          name: s.name,
          workgroup: s.workgroup,
          title: s.title
        };

        mgrs.push(mgr);
      });

      return mgrs;

    }, function (err) {
      console.log(err)
    })
  },

  get_distinct_supes: function () {
    var supe_query = query_default.get_distinct_supes
    var supes = []

    sql.execute({
      query: supe_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var supe = {
          id: s.id,
          name: s.name,
          workgroup: s.workgroup,
          title: s.title
        };

        supes.push(supe);
      });

      return supes;

    }, function (err) {
      console.log(err)
    })
  },

  get_workgroups: function () {
    var wrkgrp_query = query_default.get_current_workgroups
    var wrkgrps = []

    sql.execute({
      query: wrkgrp_query
    }).then(function (data) {
      console.log(data)

      _.forEach(data, function (s) {
        var wrkgrp = {
          id: s.id,
          name: s.name
        };

        wrkgrps.push(wrkgrp);
      });

      return wrkgrps;

    }, function (err) {
      console.log(err)
    })
  }
}
