import clickOutside from "./click-ouside.js";

const Directives = {
  install(app) {
    app.directive("click-outside", clickOutside);
  },
};

export default Directives;
