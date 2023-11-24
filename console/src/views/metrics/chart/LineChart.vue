<template>
  <canvas id="chart" ref="chart" />
</template>

<script lang="ts">
import Chart from "chart.js/auto";
import { merge } from "lodash-es";
import { shallowRef } from "vue";

export default {
  props: {
    data: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    datasets: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return { ...props };
  },
  data() {
    return {
      chart: undefined,
      colors: [
        {
          borderColor: "rgb(255, 224, 138)",
          backgroundColor: "rgba(255, 224, 138, .1)",
        },
        {
          borderColor: "rgb(62, 142, 208)",
          backgroundColor: "rgba(62, 142, 208, .1)",
        },
        {
          borderColor: "rgb(0, 209, 178)",
          backgroundColor: "rgba(0, 209, 178, .1)",
        },
      ],
    };
  },
  watch: {
    data: {
      handler(newData) {
        if (this.chart) {
          const data = newData[newData.length - 1];
          const chartData = this.chart.data;
          const datasets = chartData.datasets;

          Object.keys(this.datasets).forEach((id) => {
            if (data[id] === undefined) {
              return;
            }
            datasets.find((dataset) => dataset.id === id).data.push(data[id]);
          });
          datasets.forEach(item => {
            if(item.data.every(v => v === undefined)) {
              datasets.indexOf(item) > -1 && datasets.splice(datasets.indexOf(item), 1)
            }
          })

          chartData.labels.push(data[this.label]);

          this.chart.update();
        }
      },
      deep: true,
    },
  },
  mounted() {
    const _data = this.data;
    const labels = _data.map((d) => d[this.label]);
    const minTimestamp = Math.min(...labels);

    const datasets = Object.keys(this.datasets).map((id, idx) => {
      const config = this.datasets[id];

      return {
        id,
        borderColor: config.borderColor ?? this.colors[idx].borderColor,
        backgroundColor:
          config.backgroundColor ?? this.colors[idx].backgroundColor,
        pointHoverRadius: 5,
        label: config.label,
        data: [..._data.map((d) => d[id])],
        fill: true,
      };
    });

    const config = {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        animation: {
          duration: 0,
        },
        plugins: {
          filler: {
            propagate: true,
          },
          legend: {
            labels: {
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.datasets.length) {
                  const {
                    labels: { pointStyle },
                  } = chart.legend.options;

                  return data.datasets.map((dataset, i) => {
                    const style = this.colors[i];

                    return {
                      text: dataset.label,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      lineWidth: 2,
                      pointStyle,
                      hidden: !chart.getDataVisibility(i),

                      // Extra data used for toggling the correct item
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
        },
        elements: {
          line: {
            tension: 0,
            borderWidth: 2,
          },
          point: {
            radius: 0,
            hitRadius: 30,
          },
        },
        scales: {
          y: {
            min: 0,
          },
          x: {
            type: "linear",
            min: minTimestamp,
            time: {
              displayFormats: {
                quarter: "HH:mm:ss",
              },
            },
            ticks: {
              autoSkip: false,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.chart = shallowRef(
      new Chart(this.$refs.chart, merge(config, this.config))
    );
  },
  beforeUnmount() {
    this.chart.destroy();
  },
};
</script>
