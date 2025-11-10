import * as TimelineComponets from "./components/Timeline";
import * as ListComponents from "./components/List";
import MyGraph from "./MyGraphs";
import MyTimeline from "./MyTimeline.vue";

const install = (Vue) => {
  if (install.installed) return;
  install.installed = true;

  for (const component in TimelineComponets) {
    if (Object.prototype.hasOwnProperty.call(TimelineComponets, component)) {
      const SingleComponent = TimelineComponets[component];
      Vue.component(component.name, SingleComponent);
      component.install = install;
    }
  }

  for (const component in ListComponents) {
    if (Object.prototype.hasOwnProperty.call(ListComponents, component)) {
      const SingleComponent = ListComponents[component];
      Vue.component(component.name, SingleComponent);
      component.install = install;
    }
  }

  Vue.component(MyGraph.name, MyGraph);
  MyGraph.install = install;
};

const plugin = {
  install,
};

let GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
}

const { List, ListHeader, ListRow } = ListComponents;
const { Timeline, TimelineItem, TimelineRow } = TimelineComponets;

// Export plugin for Vue.use()
export default plugin;

// Export individual components
export {
  Timeline,
  TimelineItem,
  TimelineRow,
  List,
  ListHeader,
  ListRow,
  MyGraph,
  MyTimeline,
  plugin,
  install,
};
