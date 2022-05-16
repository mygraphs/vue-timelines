export const clickOutside = (element, callback) => {
  const bodyEventListener = (event) => {
    if (!(element === event.target || element.contains(event.target))) {
      callback();
      document.removeEventListener("click", bodyEventListener);
    }
  };

  document.addEventListener("click", bodyEventListener);
  return bodyEventListener;
};
