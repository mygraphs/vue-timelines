export default {
  beforeMount(el, binding) {
    el.bodyEventListener = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
        document.removeEventListener("click", el.bodyEventListener);
      }
    };

    el.clickOutsideEvent = () => {
      document.addEventListener("click", el.bodyEventListener);
    };

    el.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
