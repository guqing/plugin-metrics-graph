<script lang="ts" setup>
import moment from "moment";
import { reactive, ref } from "vue";
import LineChart from "./LineChart.vue";

const props = defineProps({
  data: Array,
});

const datasets = ref({
  acquired: {
    label: "活动连接数",
  },
  allocated: {
    label: "连接总数",
  },
  idle: {
    label: "空闲连接数"
  },
  maxAllocated: {
    label: "最大连接数"
  },
  pending: {
    label: "当前挂起数"
  }
});

const config = reactive({
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          title: function (ctx) {
            return ctx[0].parsed.y;
          },
          label: function (ctx) {
            return ctx.dataset.label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (label: string) => {
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
    label="timestamp"
    :datasets="datasets"
    :config="config"
    :data="props.data"
  />
</template>
