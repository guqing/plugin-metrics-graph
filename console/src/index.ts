import { definePlugin } from "@halo-dev/console-shared";
import { defineAsyncComponent, markRaw } from "vue";
import "uno.css";
import MaterialSymbolsAreaChartOutlineRounded from "~icons/material-symbols/area-chart-outline-rounded";
import { VLoading } from "@halo-dev/components";

export default definePlugin({
  routes: [
    {
      parentName: "OverviewRoot",
      route: {
        path: "/metrics",
        name: "Metrics",
        component: defineAsyncComponent({
          loader: () => import("./views/Index.vue"),
          loadingComponent: VLoading,
        }),
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
