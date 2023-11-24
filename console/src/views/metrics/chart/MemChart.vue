<script lang="ts" setup>
import moment from "moment";
import prettyBytes from "pretty-bytes";
import { reactive } from "vue";
import LineChart from "./LineChart.vue";

const props = defineProps({
  data: Array,
});

const datasets = reactive({
  used: {
    label: "已用",
  },
  metaspace: {
    label: "元空间",
  },
  committed: {
    label: "当前可用",
  },
});

const config = reactive({
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          title: (ctx) => {
            return prettyBytes(ctx[0].parsed.y);
          },
          label: (ctx) => {
            return ctx.dataset.label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (label) => {
            return prettyBytes(label);
          },
        },
      },
      x: {
        ticks: {
          callback: (label) => {
            return moment(label).format("HH:mm:ss");
          },
        },
      },
    },
  },
});
</script>
<template>
  <LineChart
    :config="config"
    :data="props.data"
    :datasets="datasets"
    label="timestamp"
  />
</template>
