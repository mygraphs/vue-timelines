export const clickOutside = (element, callback) => {
  console.log("[clickOutside] Setting up click-outside listener for element:", element);

  const bodyEventListener = (event) => {
    if (!element) {
      console.log("[clickOutside] Element is null, ignoring");
      return;
    }

    const target = event.target;
    console.log("[clickOutside] Click detected on:", target, "Element:", element);

    // Check if click is outside the element
    // Also exclude clicks on modals and task panels to prevent closing when modal opens
    const isModal = target.closest('.vfm') ||
                    target.closest('.task__panel') ||
                    target.closest('[data-vfm]') ||
                    target.closest('.data__panel') ||
                    target.closest('.vfm__content') ||
                    target.closest('.vfm__overlay');

    const isInside = element === target || element.contains(target);
    console.log("[clickOutside] isInside:", isInside, "isModal:", !!isModal);

    if (!isInside && !isModal) {
      console.log("[clickOutside] Click is outside and not on modal, calling callback");
      callback();
      document.removeEventListener("click", bodyEventListener, true);
    } else {
      console.log("[clickOutside] Click ignored (inside element or on modal)");
    }
  };

  // Use capture phase and a small delay to avoid immediate trigger
  setTimeout(() => {
    console.log("[clickOutside] Adding event listener");
    document.addEventListener("click", bodyEventListener, true);
  }, 0);

  return bodyEventListener;
};
