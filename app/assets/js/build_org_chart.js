require('orgchart')

var org_chart_options = {
  'data': orgObj,
  'nodeID': 'id',
  'nodeContent': 'title',
  'exportButton': true,
  'exportFilename': 'DMS Org Chart'
}

function build_org_chart () {
  $('#chart-container').orgchart(org_chart_options);
}

module.exports = build_org_chart;
