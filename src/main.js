import { createApp } from "vue";
import App from "./App.vue";

import store from './store/store';

// Import theme styles
import "./styles/themes/index.css";
import "./styles/themes/dark.css";

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

const app = createApp(App);

app.use(store);
app.mount("#app");
