import { definePlugin } from "@halo-dev/console-shared";
import IndexView from "./views/Index.vue";
import { markRaw } from "vue";
import "./styles/tailwind.css";
import MaterialSymbolsAreaChartOutlineRounded from "~icons/material-symbols/area-chart-outline-rounded";

export default definePlugin({
  components: {},
  routes: [
    {
      parentName: "OverviewRoot",
      route: {
        path: "/metrics",
        name: "Metrics",
        component: IndexView,
        meta: {
          title: "指标监控",
          permissions: ["system:actuator:manage"],
          searchable: true,
          menu: {
            name: "指标监控",
            icon: markRaw(MaterialSymbolsAreaChartOutlineRounded),
            priority: 0,
          },
        },
      },
    },
  ],
  extensionPoints: {},
});
