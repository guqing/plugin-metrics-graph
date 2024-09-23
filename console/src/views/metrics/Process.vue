<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { VCard } from "@halo-dev/components";
import Instance from "@/services/instance";
import { concatMap, retry, timer } from "rxjs";
import { toMillis } from "@/utils/moment";
import { useSubscription } from "@/composables/subscription";
import moment from "moment";

var props = defineProps({
  instance: Instance,
});

const data = reactive({
  pid: null,
  uptime: {
    value: 0,
    baseUnit: "seconds",
  },
  systemCpuLoad: 0,
  processCpuLoad: 0,
  systemCpuCount: 0,
  cpus: 0,
});

onMounted(async () => {
  await fetchPid();
  await fetchUptime();
  await fetchCpuCount();
});

const formatUptime = (millis: number) => {
  return moment(new Date().getTime() - millis).fromNow(true);
};
const metrics = computed(() => {
  return [
    {
      label: "进程ID",
      value: data.pid,
    },
    {
      label: "运行时间",
      value: formatUptime(toMillis(data.uptime.value, data.uptime.baseUnit)),
    },
    {
      label: "进程CPU使用率",
      value: (data.processCpuLoad?.valueOf() * 100).toFixed(2) + "%",
    },
    {
      label: "系统CPU使用率",
      value: (data.systemCpuLoad?.valueOf() * 100).toFixed(2) + "%",
    },
    {
      label: "CPU核心数",
      value: data.systemCpuCount,
    },
  ];
});

const hasLoadedRef = ref(false);
const errorRef = ref();

const fetchMetric = async (name: string) => {
  const response = await props.instance.fetchMetric(name);
  return response.data;
};
const fetchUptime = async () => {
  try {
    const response = await fetchMetric("process.uptime");
    data.uptime = {
      value: response.measurements[0].value,
      baseUnit: response.baseUnit,
    };
  } catch (error) {
    errorRef.value = error;
    console.warn("Fetching Uptime failed:", error);
  } finally {
    hasLoadedRef.value = true;
  }
};

const fetchPid = async () => {
  if (await props.instance.hasEndpoint("env")) {
    try {
      const response = await props.instance.fetchEnv("PID");
      data.pid = response.data.property.value;
    } catch (error) {
      console.warn("Fetching PID failed:", error);
    } finally {
      hasLoadedRef.value = true;
    }
  }
};

const fetchCpuCount = async () => {
  try {
    data.systemCpuCount = (
      await fetchMetric("system.cpu.count")
    ).measurements[0].value;
  } catch (error) {
    console.warn("Fetching Cpu Count failed:", error);
  } finally {
    hasLoadedRef.value = true;
  }
};

const fetchCpuLoadMetrics = async () => {
  const fetchProcessCpuLoad = fetchMetric("process.cpu.usage");
  const fetchSystemCpuLoad = fetchMetric("system.cpu.usage");
  let processCpuLoad;
  let systemCpuLoad;
  try {
    processCpuLoad = (await fetchProcessCpuLoad).measurements[0].value;
  } catch (error) {
    console.warn("Fetching Process CPU Load failed:", error);
  }
  try {
    systemCpuLoad = (await fetchSystemCpuLoad).measurements[0].value;
  } catch (error) {
    console.warn("Fetching Sytem CPU Load failed:", error);
  }
  return {
    processCpuLoad,
    systemCpuLoad,
  };
};

const createSubscription = () => {
  return timer(0, 2500)
    .pipe(
      concatMap(fetchCpuLoadMetrics),
      retry({
        count: 5,
        delay: 1000,
      })
    )
    .subscribe({
      next: (item) => {
        data.processCpuLoad = item.processCpuLoad;
        data.systemCpuLoad = item.systemCpuLoad;
      },
      error: (error) => {
        hasLoadedRef.value = true;
        console.warn("Fetching CPU Usage metrics failed:", error);
        errorRef.value = error;
      },
    });
};
useSubscription(createSubscription);
</script>
<template>
  <VCard v-if="hasLoadedRef" title="进程">
    <div class="grid grid-cols-3 gap-4">
      <div class="text-center" v-for="item in metrics" :key="item.label">
        <p class="font-bold" v-text="item.label"></p>
        <p v-text="item.value" />
      </div>
    </div>
  </VCard>
</template>
