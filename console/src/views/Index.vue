<script setup lang="ts">
import { ref } from "vue";
import Instance from "@/services/instance";
import DetailsGc from "./metrics/GC.vue";
import Memory from "./metrics/Memory.vue";
import Process from "./metrics/Process.vue";
import Threads from "./metrics/Threads.vue";
import R2dbcSource from "./metrics/R2dbcSource.vue";
import { VPageHeader } from "@halo-dev/components";

const instance = ref(new Instance());
</script>

<template>
  <VPageHeader title="指标监控"> </VPageHeader>
  <div class="grid grid-cols-1 gap-4 md-0 md:m-4">
    <DetailsGc :instance="instance"></DetailsGc>
    <Process :instance="instance"></Process>
    <div class="grid sm:grid-cols-1 gap-2 md:grid-cols-2">
      <Memory :instance="instance" type="heap"></Memory>
      <Memory :instance="instance" type="nonheap"></Memory>
    </div>
    <div class="grid sm:grid-cols-1 gap-2 md:grid-cols-2">
      <Threads :instance="instance"></Threads>
      <R2dbcSource :instance="instance"></R2dbcSource>
    </div>
  </div>
</template>
