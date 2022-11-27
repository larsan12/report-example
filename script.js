am5.ready(function() {
  setTitle('Конфигурация');
  setInfo(data.settings);

  setTitle('Основная статистика');
  setInfo(data.summary);

  setTitle('Прибыль робота');
  drawDealsChart('prof_com');

  setTitle('Сделки');
  drawDeals('deals_table');

  setTitle('График цены');
  drawHistoryChart('history');

  setTitle('Параметры оптимизации');
  setInfo(data.parameters);
})

function setTitle(title) {
  $('div.all').first().append(
    `<div class="title">
        <label>${title}</label>
    </div>`,
  );
}

function drawDeals(cl) {
  $('div.all').first().append(`<table id="${cl}" class="table">
  <thead>
    <tr>
      <th>symbol</th>
      <th>volume</th>
      <th>type</th>
      <th>sl</th>
      <th>tp</th>
      <th>time_open</th>
      <th>time_close</th>
      <th>price_open</th>
      <th>price_close</th>
      <th>comment</th>
      <th>profit</th>
    </tr>
  </thead>
  <tbody>
  ${data.positions.map(pos => `
    <tr>
      <td>${pos.symbol || ''}</td>
      <td>${pos.volume || ''}</td>
      <td>${pos.type}</td>
      <td>${pos.sl || ''}</td>
      <td>${pos.tp || ''}</td>
      <td>${pos.time_open ? new Date(pos.time_open).toISOString() : ''}</td>
      <td>${pos.time_close ? new Date(pos.time_close).toISOString() : ''}</td>
      <td>${pos.price_open || ''}</td>
      <td>${pos.price_close || ''}</td>
      <td>${pos.comment || ''}</td>
      <td>${pos.profit}</td>
    </tr>
  `).join('')} 
  </tbody>
  </table>`);
  $(`#${cl}`).DataTable({ pageLength: 30, order: [[ 5, 'asc' ]] });
}

function setInfo(obj) {
  let str = '';
  Object.keys(obj).forEach((k) => {
    if (obj[k] != {}.toString()) {
      str += `<label>${k}:${obj[k]}</label>`;
    }
  });
  $('div.all').first().append(
    `<div class="statistic">
        ${str}
    </div>`,
  );
}

function drawChartBasic(cl, yCol, xCol, labelText) {
  var root = am5.Root.new(cl);
    root.setThemes([am5themes_Animated.new(root)]);
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      wheelX: "zoomX",
      wheelY: "zoomX"
    }));
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "zoomX" }));
    cursor.lineY.set("visible", false);
    // Create axes
    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      tooltip: am5.Tooltip.new(root, { tooltipText: '{valueY}'})
    }));
    // Add series
    var series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: yCol,
      valueXField: xCol,
      tooltip: am5.Tooltip.new(root, {
        labelText,
      })
    }));

    // Add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    return {root, series};
}

function drawDealsChart(cl) {
  $('div.all').first().append(`<div id="${cl}" class="graph"></div>`)
  var {root, series} = drawChartBasic(cl, "totalProfit", "time_create", getDescription());
  series.bullets.push(function() {
    return am5.Bullet.new(root, {
      locationY: 1,
      locationX: 0.5,
      sprite: am5.Triangle.new(root, {
        width: 8,
        height: 8,
        templateField: "bulletSettings",
      })
    });
  });
  series.data.setAll(data.deals.map(deal => ({
    ...deal,
    bulletSettings: {
      fill: series.get("fill"),
      rotation: deal.entry === 'in' ? 0 : 180,
    }
  })));
}

function drawHistoryChart(cl) {
  $('div.all').first().append(`<div id="${cl}" class="graph"></div>`)
  var {series} = drawChartBasic(cl, "close", "time", `{valueY}`);
  series.data.setAll(data.rates);
}

function getDescription() {
  return `{id} {entry}
type: {type}
profit: {profit}
price: {price}
comment: {comment}
{valueY}`
};
