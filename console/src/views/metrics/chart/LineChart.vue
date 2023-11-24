<script lang="ts" setup>
import Chart from "chart.js/auto";
import { merge } from "lodash-es";
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";

const generateUniqueId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

const props = defineProps({
  data: Array,
  label: String,
  datasets: Object,
  config: Object,
});

const chartId = ref<string>(`chart-${generateUniqueId()}`);
const chartRef = shallowRef<Chart>();
const colorsRef = ref([
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
]);

watch(
  () => props.data,
  (newData) => {
    if (chartRef.value && newData) {
      const data = newData[newData.length - 1];
      const chartData = chartRef.value.data;
      const datasets = chartData.datasets;

      Object.keys(props.datasets).forEach((id) => {
        if (data[id] === undefined) {
          return;
        }
        datasets.find((dataset) => dataset.id === id).data.push(data[id]);
      });
      datasets.forEach((item) => {
        if (item.data.every((v) => v === undefined)) {
          datasets.indexOf(item) > -1 &&
            datasets.splice(datasets.indexOf(item), 1);
        }
      });

      chartData.labels.push(data[props.label]);

      chartRef.value.update();
    }
  },
  { deep: true }
);

const generateLabels = (aChart: Chart) => {
  const data = aChart.data;
  if (data.datasets.length) {
    const {
      labels: { pointStyle },
    } = aChart.legend.options;

    return data.datasets.map((dataset, i) => {
      const style = colorsRef.value[i];

      return {
        text: dataset.label,
        fillStyle: style.backgroundColor,
        strokeStyle: style.borderColor,
        lineWidth: 2,
        pointStyle,
        hidden: !aChart.getDataVisibility(i),

        // Extra data used for toggling the correct item
        index: i,
      };
    });
  }
  return [];
};

onMounted(() => {
  const _data = props.data;
  const labels = _data.map((d) => d[props.label]);
  const minTimestamp = Math.min(...labels);

  const datasets = Object.keys(props.datasets).map((id, idx) => {
    const config = props.datasets[id];

    return {
      id,
      borderColor: config.borderColor ?? colorsRef.value[idx].borderColor,
      backgroundColor:
        config.backgroundColor ?? colorsRef.value[idx].backgroundColor,
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
            generateLabels: generateLabels,
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

  const ctx = document.getElementById(chartId.value) as HTMLCanvasElement;
  chartRef.value = new Chart(ctx, merge(config, props.config));
});

onBeforeUnmount(() => {
  if (chartRef.value) {
    chartRef.value.destroy();
  }
});
</script>
<template>
  <canvas :id="chartId" ref="chartRef" />
</template>