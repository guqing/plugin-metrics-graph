<script setup lang="ts">
import { onMounted, ref } from "vue";
import Instance from "@/services/instance";
import DetailsGc from "./metrics/GC.vue";
import Memory from "./metrics/Memory.vue";
import Process from "./metrics/Process.vue";
import { VPageHeader } from "@halo-dev/components";

const instance = ref(new Instance())
</script>

<template>
  <VPageHeader title="指标监控"> </VPageHeader>
  <div class="grid grid-cols-1 gap-4 md-0 md:m-4">
    <DetailsGc :instance="instance"></DetailsGc>
    <Process :instance="instance"></Process>
    <div class="grid grid-cols-2 gap-2 md:grid-cols-1">
      <Memory :instance="instance" type="heap"></Memory>
      <Memory :instance="instance" type="nonheap"></Memory>
    </div>
  </div>
</template>
