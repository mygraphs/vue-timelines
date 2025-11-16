import { createApp } from "vue";
import App from "./App.vue";

import store from './store/store';
import { VERSION, NAME, DESCRIPTION, AUTHOR, LICENSE } from './version';

// Import theme styles
import "./styles/themes/index.css";
import "./styles/themes/dark.css";

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

// Log version information on app load
console.log(`%c[${NAME}]`, 'color: #42b983; font-weight: bold;', `${NAME} v${VERSION} - ${DESCRIPTION}`);
console.log(`%c[${NAME}]`, 'color: #42b983;', `Author: ${AUTHOR} | License: ${LICENSE}`);

const app = createApp(App);

app.use(store);
app.mount("#app");
