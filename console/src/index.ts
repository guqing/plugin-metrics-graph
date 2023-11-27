import { definePlugin } from "@halo-dev/console-shared";
import IndexView from "./views/Index.vue";
import { markRaw } from "vue";
import "./styles/tailwind.css";
import MaterialSymbolsAreaChartOutlineRounded from '~icons/material-symbols/area-chart-outline-rounded';

export default definePlugin({
  components: {},
  routes: [
    {
      parentName: "Root",
      route: {
        path: "/metrics",
        name: "Metrics",
        component: IndexView,
        meta: {
          title: "MetricsInsight",
          searchable: true,
          menu: {
            name: "指标监控",
            group: "tool",
            icon: markRaw(MaterialSymbolsAreaChartOutlineRounded),
            priority: 0,
          },
        },
      },
    },
  ],
  extensionPoints: {},
});
