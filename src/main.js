import { createApp } from "vue";
import App from "./App.vue";

import store from './store/store';

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import { VueDatePicker } from '@vuepic/vue-datepicker';

const app = createApp(App);

app.use(store);
app.component('VueDatePicker', VueDatePicker);
app.mount("#app");
