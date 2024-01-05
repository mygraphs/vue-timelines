import { createApp } from "vue";
import App from "./App.vue";

import store from './store/store';

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

const app = createApp(App);

app.use(store);
app.mount("#app");
