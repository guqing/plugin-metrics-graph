<script setup lang="ts">
import { VCard } from "@halo-dev/components";
import moment from "moment";
import { retry } from "rxjs/operators";

import { useSubscription } from "@/composables/subscribing";
import Instance from "@/services/instance";
import { concatMap, timer } from "@/utils/rxjs";
import { toMillis } from "@/utils/moment";
import { ref } from "vue";

var props = defineProps({
  instance: Instance,
});

const hasLoaded = ref(false);
const error = ref(null);
const current = ref(null);

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
      },
      error: (error) => {
        hasLoaded.value = true;
        console.warn("Fetching GC metrics failed:", error);
        error = error;
      },
    });
};
useSubscription(createSubscription);

const fetchMetrics = async () => {
  const response = await props.instance.fetchMetric("jvm.gc.pause");
  const measurements = response.data.measurements.reduce(
    (current, measurement) => ({
      ...current,
      [measurement.statistic.toLowerCase()]: measurement.value,
    }),
    {}
  );
  return {
    ...measurements,
    total_time: moment.duration(
      toMillis(measurements.total_time, response.baseUnit)
    ),
    max: moment.duration(toMillis(measurements.max, response.baseUnit)),
  };
};
</script>
<template>
  <VCard v-if="hasLoaded" title="垃圾回收">
    <div v-if="current" class="flex w-full">
      <div class="flex-1 text-center">
        <p class="font-bold">总计</p>
        <p v-text="current.count" />
      </div>
      <div class="flex-1 text-center">
        <p class="font-bold">总耗时</p>
        <p v-text="`${current.total_time.asSeconds().toFixed(4)}s`" />
      </div>
      <div class="flex-1 text-center">
        <p class="font-bold">最大耗时</p>
        <p v-text="`${current.max.asSeconds().toFixed(4)}s`" />
      </div>
    </div>
  </VCard>
</template>
