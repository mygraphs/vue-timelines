export const clickOutside = (element, callback) => {
  const bodyEventListener = (event) => {
    if (!element) {
      console.log(" Missing element ");
      // Missing element
      return;
    }
    console.log(" Clicked on document " + event.target);
    if (!(element === event.target || element.contains(event.target))) {
      callback();
      document.removeEventListener("click", bodyEventListener);
    }
  };

  document.addEventListener("click", bodyEventListener);
  return bodyEventListener;
};
