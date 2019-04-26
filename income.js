var chart;

function money(value) {
  var currency_opts = { style: 'currency', currency: 'MXN', maximumFractionDigits: 0, minimumFractionDigits: 0 };
  var currency = new Intl.NumberFormat('es-MX', currency_opts);
  return currency.format(value);
}

Vue.filter('money', v => money(v));
Vue.filter('perc', v => (v * 100).toFixed(0) + '%');

var cities = [
  { name: 'Monterrey', median: 4660, percs: [33, 47, 20], medians: [2515, 5466, 16392],
    deciles: [0.00, 2102.49, 2788.00, 3338.51, 3918.79, 4660.84, 5937.28, 7240.95, 9300.54, 16391.81, 18720.15] },
  { name: 'Guadalupe', median: 4842, percs: [31, 53, 16], medians: [2715, 5541, 13832],
    deciles: [0.00, 2153.99, 2878.81, 3583.53, 4252.31, 4842.02, 5677.26, 6974.59, 8687.45, 12719.51, 19028.74] },
];

var input = new Vue({
  el: '#input',
  data: {
    income: 5000,
    city: cities[0],
    cities: cities,
  },
  methods: {
    getPercentage: function() {
      var income = this.income;
      var deciles = this.city.deciles;
      var i = deciles.findIndex(e => e >= income);
      var perc;

      if (i >= 0) {
        var base = (i - 1) / 10;
        var prev = deciles[i - 1];
        var next = deciles[i];
        var extra = ((income - prev) / (next - prev)) * 0.1;

        perc = base + extra;
      } else {
        perc = 1.0;
      }

      return perc;
    },
    getClass: function() {
      if (this.income < this.city.median * 0.75) {
        return 'Lower';
      } else if (this.income < this.city.median * 2.0) {
        return 'Middle';
      } else {
        return 'Upper';
      }
    },
  },
  watch: {
    income: function(value) {
      chart.update();
    },
    city: function(value) {
      chart.data.datasets[0].data = value.percs;
      chart.update();
    },
  },
});

var chart = new Chart('chart', {
  type: 'doughnut',
  data: {
    datasets: [{
      data: input.city.percs,
      backgroundColor: [ '#f678', '#fc58', '#39e8' ],
      borderColor: [ '#f67f', '#fc5f', '#39ef' ],
      borderWidth: 4,
      borderAlign: 'inner',
    }],
    labels: [ 'Lower', 'Middle', 'Upper' ],
  },
  options: {
    aspectRatio: 1,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'bottom',
      reverse: true,
      labels: {
        padding: 20,
      }
    },
    tooltips: {
      callbacks: {
        label: function(item, data) {
          var c = input.city;
          var i = item.index;
          return `${money(c.medians[i])} (${c.percs[i]}%)`;
        },
        title: function(items, data) {
          return data.labels[items[0].index];
        }
      }
    },
    layout: {
      padding: 20,
    },
  },
});

var drawInputPlugin = {
  afterDatasetsDraw: function(chart, easing) {
    var perc = input.getPercentage();
    var area = chart.chartArea;
    var x = (area.left + area.right) / 2;
    var y = (area.top + area.bottom) / 2;
    var innerRadius = chart.innerRadius - 4;
    var outerRadius = chart.outerRadius + 4;

    var ctx = chart.ctx;
    var angle = Math.PI * -0.5;

    angle += Math.PI * 2 * perc;

    ctx.save();

    ctx.strokeStyle = '#0008';
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
    ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
    ctx.stroke();

    ctx.restore();
  },
};

Chart.plugins.register(drawInputPlugin);
