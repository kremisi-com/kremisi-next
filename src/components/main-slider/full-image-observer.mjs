const LOAD_FULL_IMAGE = "load";
const RESET_FULL_IMAGE = "reset";

export function createFullImageObserverController({
  rootMargin = "300px",
  createObserver,
} = {}) {
  const registrations = new Map();
  let observer = null;
  let isActive = false;

  function resolveObserverFactory() {
    if (createObserver) return createObserver;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return null;
    }

    return (callback, options) =>
      new window.IntersectionObserver(callback, options);
  }

  function handleIntersections(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const notify = registrations.get(entry.target);
      if (!notify) return;

      observer?.unobserve(entry.target);
      notify(LOAD_FULL_IMAGE);
    });
  }

  function register(element, notify) {
    registrations.set(element, notify);
    if (isActive && observer) observer.observe(element);

    return () => {
      observer?.unobserve(element);
      registrations.delete(element);
    };
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    const observerFactory = resolveObserverFactory();
    if (!observerFactory) {
      registrations.forEach((notify) => notify(LOAD_FULL_IMAGE));
      return;
    }

    observer = observerFactory(handleIntersections, { rootMargin });
    registrations.forEach((_, element) => observer.observe(element));
  }

  function deactivate({ reset = true } = {}) {
    if (!isActive && !observer) return;

    isActive = false;
    observer?.disconnect();
    observer = null;

    if (reset) {
      registrations.forEach((notify) => notify(RESET_FULL_IMAGE));
    }
  }

  function destroy() {
    deactivate({ reset: false });
    registrations.clear();
  }

  return { activate, deactivate, destroy, register };
}

export const FULL_IMAGE_OBSERVER_ACTIONS = {
  load: LOAD_FULL_IMAGE,
  reset: RESET_FULL_IMAGE,
};
