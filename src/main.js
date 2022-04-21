import { createApp } from "vue";
import App from "./App.vue";
import CustomDirectives from "./directives";

const app = createApp(App);

app.use(CustomDirectives);
app.config.unwrapInjectedRef = true;
app.mount("#app");
