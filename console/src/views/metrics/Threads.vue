<script lang="ts" setup>
import { reactive, ref } from "vue";
import { VCard } from "@halo-dev/components";
import Instance from "@/services/instance";
import { concatMap, retry, timer } from "rxjs";
import { useSubscription } from "@/composables/subscription";
import moment from "moment";
import type { Ref } from "vue";

import ThreadsChart from "./chart/Threads.vue";

type ThreadInfo = {
  live: number;
  peak: number;
  daemon: number;
  timestamp?: number | undefined;
};

var props = defineProps({
  instance: Instance,
});

const state = reactive({
  hasLoaded: false,
  error: null,
  current: {} as ThreadInfo,
});

const chartData: Ref<Array<ThreadInfo>> = ref([]);

const fetchMetrics = async () => {
  const responseLive = props.instance.fetchMetric("jvm.threads.live");
  const responsePeak = props.instance.fetchMetric("jvm.threads.peak");
  const responseDaemon = props.instance.fetchMetric("jvm.threads.daemon");

  return {
    live: (await responseLive).data.measurements[0].value,
    peak: (await responsePeak).data.measurements[0].value,
    daemon: (await responseDaemon).data.measurements[0].value,
  };
};

const createSubscription = () => {
  return timer(0, 2500)
    .pipe(
      concatMap(fetchMetrics),
      retry({
        count: 5,
        delay: 1000,
      })
    )
    .subscribe({
      next: (data) => {
        state.hasLoaded = true;
        state.current = data;
        chartData.value.push({ ...data, timestamp: moment().valueOf() });
      },
      error: (error) => {
        state.hasLoaded = true;
        console.warn("Fetching threads metrics failed:", error);
        state.error = error;
      },
    });
};
useSubscription(createSubscription);
</script>
<template>
  <VCard v-if="state.hasLoaded" title="线程">
    <div class="pmg-grid pmg-grid-cols-8 pmg-gap-4">
      <div v-if="state.current" class="pmg-col-span-2 pmg-grid pmg-grid-rows-5 pmg-grid-flow-col gap-4">
        <div>
          <p>活动线程</p>
          <p v-text="state.current.live" />
        </div>
        <div>
          <p>守护线程</p>
          <p v-text="state.current.daemon" />
        </div>
        <div>
          <p>线程峰值</p>
          <p v-text="state.current.peak" />
        </div>
      </div>

      <div class="pmg-col-span-6">
        <ThreadsChart v-if="chartData.length > 0" :data="chartData" />
      </div>
    </div>
  </VCard>
</template>
