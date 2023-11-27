<script setup lang="ts">
import moment from "moment";
import { concatMap, timer } from "rxjs";
import { retry } from "rxjs/operators";

import { VCard } from "@halo-dev/components";
import { useSubscription } from "@/composables/subscribing";
import Instance from "@/services/instance";
import R2dbcSoruceChart from "./chart/R2dbcSource.vue";
import { reactive, ref } from "vue";
import type { Ref } from "vue";

type DatasourceInfo = {
  acquired: number;
  allocated: number;
  idle: number;
  maxAllocated: number;
  pending: number;
  timestamp?: number | undefined;
};

const props = defineProps({
  instance: Instance,
});

const state = reactive({
  hasLoaded: false,
  error: null,
  current: {} as DatasourceInfo,
});
const chartData: Ref<Array<DatasourceInfo>> = ref([]);

const fetchMetrics = async () => {
  const responseAcquired = props.instance.fetchMetric("r2dbc.pool.acquired");
  const responseAllocated = props.instance.fetchMetric("r2dbc.pool.allocated");
  const responseIdle = props.instance.fetchMetric("r2dbc.pool.idle");
  const responseMaxAllocated = props.instance.fetchMetric(
    "r2dbc.pool.max.allocated"
  );
  const responsePending = props.instance.fetchMetric("r2dbc.pool.pending");
  return {
    acquired: (await responseAcquired).data.measurements[0].value,
    allocated: (await responseAllocated).data.measurements[0].value,
    idle: (await responseIdle).data.measurements[0].value,
    maxAllocated: (await responseMaxAllocated).data.measurements[0].value,
    pending: (await responsePending).data.measurements[0].value,
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
      error: (err) => {
        state.hasLoaded = true;
        console.warn(`Fetching r2dbc datasource metrics failed:`, err);
        state.error = err;
      },
    });
};
useSubscription(createSubscription);
</script>
<template>
  <VCard v-if="state.hasLoaded" title="R2DBC 数据源">
    <div class="pmg-grid pmg-grid-cols-8 pmg-gap-4">
      <div v-if="state.current" class="level datasource-current pmg-col-span-2 pmg-grid pmg-grid-rows-5 pmg-grid-flow-col gap-4">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading has-bullet has-bullet-info">活动连接数</p>
            <p v-text="state.current.acquired" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">连接总数</p>
            <p v-text="state.current.allocated" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">空闲连接数</p>
            <p v-text="state.current.idle" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">最大连接数</p>
            <p v-text="state.current.maxAllocated" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">当前挂起数</p>
            <p v-text="state.current.pending" />
          </div>
        </div>
      </div>
      <div class="pmg-col-span-6">
        <R2dbcSoruceChart
        v-if="chartData.length > 0"
        :data="chartData"
      />
      </div>
    </div>
  </VCard>
</template>
