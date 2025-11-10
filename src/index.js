import * as TimelineComponets from "./components/Timeline";
import * as ListComponents from "./components/List";
import MyGraph from "./MyGraphs";
import MyTimeline from "./MyTimeline.vue";
import { createTimelineStore } from "./store/store";
import { NoopApiService, DefaultApiService } from "./services";

const install = (Vue, options = {}) => {
  if (install.installed) return;
  install.installed = true;

  // Register components
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

  // If API service options provided, create and provide store
  if (options.apiService || options.apiBaseURL) {
    let apiService = options.apiService;
    if (!apiService && options.apiBaseURL) {
      apiService = new DefaultApiService({
        baseURL: options.apiBaseURL,
        apiToken: options.apiToken || ''
      });
    } else if (!apiService) {
      apiService = new NoopApiService();
    }

    const store = createTimelineStore(apiService);
    Vue.use(store);
  }
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

// Export store creation function and services
export { createTimelineStore } from './store/store';
export { ApiService, DefaultApiService, NoopApiService } from './services';

// Export theme utilities
export { applyTheme, getTheme, toggleTheme, watchSystemTheme } from './utils/theme-provider';

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
