<script lang="ts" setup>
import moment from "moment";
import prettyBytes from "pretty-bytes";
import { concatMap, timer } from "rxjs";
import { map, retry } from "rxjs/operators";

import { VCard } from "@halo-dev/components";
import { useSubscription } from "@/composables/subscribing";
import Instance from "@/services/instance";
import MemChart from "./chart/MemChart.vue";
import { computed, ref } from "vue";

const props = defineProps({
  instance: Instance,
  type: String,
});

const hasLoaded = ref(false);
const error = ref(null);
const current = ref(null);
const chartData = ref([]);

const fetchMetrics = async () => {
  const responseMax = props.instance.fetchMetric("jvm.memory.max", {
    area: props.type,
  });
  const responseUsed = props.instance.fetchMetric("jvm.memory.used", {
    area: props.type,
  });
  const hasMetaspace = (await responseUsed).data.availableTags.some(
    (tag) => tag.tag === "id" && tag.values.includes("Metaspace")
  );
  const responeMetaspace =
    props.type === "nonheap" && hasMetaspace
      ? props.instance.fetchMetric("jvm.memory.used", {
          area: props.type,
          id: "Metaspace",
        })
      : null;
  const responseCommitted = props.instance.fetchMetric("jvm.memory.committed", {
    area: props.type,
  });
  return {
    max: (await responseMax).data.measurements[0].value,
    used: (await responseUsed).data.measurements[0].value,
    metaspace: responeMetaspace
      ? (await responeMetaspace).data.measurements[0].value
      : undefined,
    committed: (await responseCommitted).data.measurements[0].value,
  };
};

const createSubscription = () => {
  return timer(0, 1000)
    .pipe(
      concatMap(fetchMetrics),
      retry({
        count: 5,
        delay: 1000,
      })
    )
    .pipe(map(obj => {
      return Object.entries(obj)
      .filter(([key, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    }))
    .subscribe({
      next: (data) => {
        hasLoaded.value = true;
        current.value = data;
        chartData.value.push({ ...data, timestamp: moment().valueOf() });
      },
      error: (err) => {
        hasLoaded.value = true;
        console.warn("Fetching memory metrics failed:", err);
        error.value = err;
      },
    });
};

useSubscription(createSubscription);

const name = computed(() => {
  switch (props.type) {
    case "heap":
      return "堆";
    case "nonheap":
      return "非堆";
    default:
      return props.type;
  }
});
</script>
<template>
  <VCard v-if="hasLoaded" :title="'内存: ' + name">
    <div v-if="current" class="flex w-full">
      <div v-if="current.metaspace" class="flex-1 text-center">
        <p class="font-bold">元空间</p>
        <p v-text="prettyBytes(current.metaspace)" />
      </div>
      <div class="flex-1 text-center">
        <p class="font-bold">已用</p>
        <p v-text="prettyBytes(current.used)" />
      </div>
      <div class="flex-1 text-center">
        <p class="font-bold">当前可用</p>
        <p v-text="prettyBytes(current.committed)" />
      </div>
      <div v-if="current.max >= 0" class="flex-1 text-center">
        <p class="font-bold">最大</p>
        <p v-text="prettyBytes(current.max)" />
      </div>
    </div>

    <MemChart v-if="chartData.length > 0" :data="chartData" class="mt-2" />
  </VCard>
</template>
<style lang="css" scoped>
.memory-current {
  margin-bottom: 0 !important;
}
</style>
