<script setup lang="ts">
import moment from "moment";
import { concatMap, timer } from "rxjs";
import { retry } from "rxjs/operators";

import { VCard } from "@halo-dev/components";
import { useSubscription } from "@/composables/subscribing";
import Instance from "@/services/instance";
import datasourceChart from "@/views/instances/details/datasource-chart";
import { ref } from "vue";

const props = defineProps({
  instance: Instance,
  dataSource: String,
});

const hasLoaded = ref(false);
const error = ref(null);
const current = ref(null);
const chartData = ref([]);

const fetchMetrics = async () => {
  const responseActive = props.instance.fetchMetric(
    "data.source.active.connections",
    { name: props.dataSource }
  );
  const responseMin = props.instance.fetchMetric(
    "data.source.min.connections",
    { name: props.dataSource }
  );
  const responseMax = props.instance.fetchMetric(
    "data.source.max.connections",
    { name: props.dataSource }
  );

  return {
    active: (await responseActive).data.measurements[0].value,
    min: (await responseMin).data.measurements[0].value,
    max: (await responseMax).data.measurements[0].value,
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
        hasLoaded.value = true;
        current.value = data;
        chartData.value.push({ ...data, timestamp: moment().valueOf() });
      },
      error: (err) => {
        hasLoaded.value = true;
        console.warn(
          `Fetching datasource ${props.dataSource} metrics failed:`,
          error
        );
        error.value = err;
      },
    });
};
useSubscription(createSubscription);
</script>
<template>
  <VCard v-if="hasLoaded" :title="'内存: ' + name"></VCard>
  <sba-panel v-if="hasLoaded" :title="'数据源: ' + props.dataSource">
    <div>
      <div v-if="current" class="level datasource-current">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading has-bullet has-bullet-info">活动连接数</p>
            <p v-text="current.active" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">最小连接数</p>
            <p v-text="current.min" />
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">最大连接数</p>
            <p v-if="current.max >= 0" v-text="current.max" />
            <p v-else>unlimited</p>
          </div>
        </div>
      </div>
      <datasource-chart v-if="chartData.length > 0" :data="chartData" />
    </div>
  </sba-panel>
</template>
<style lang="css" scoped>
.datasource-current {
  margin-bottom: 0 !important;
}
</style>
