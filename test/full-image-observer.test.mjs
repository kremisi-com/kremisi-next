import assert from "node:assert/strict";
import test from "node:test";

import {
  createFullImageObserverController,
  FULL_IMAGE_OBSERVER_ACTIONS,
} from "../src/components/main-slider/full-image-observer.mjs";

test("one shared observer watches every registered slide after activation", () => {
  const instances = [];
  const createObserver = (callback, options) => {
    const instance = {
      callback,
      options,
      observed: new Set(),
      disconnected: false,
      observe(element) {
        this.observed.add(element);
      },
      unobserve(element) {
        this.observed.delete(element);
      },
      disconnect() {
        this.disconnected = true;
        this.observed.clear();
      },
    };
    instances.push(instance);
    return instance;
  };

  const controller = createFullImageObserverController({ createObserver });
  const elements = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const actions = elements.map(() => []);

  elements.forEach((element, index) => {
    controller.register(element, (action) => actions[index].push(action));
  });

  assert.equal(instances.length, 0);
  controller.activate();
  assert.equal(instances.length, 1);
  assert.equal(instances[0].options.rootMargin, "300px");
  assert.equal(instances[0].observed.size, 3);

  instances[0].callback([
    { target: elements[0], isIntersecting: false },
    { target: elements[1], isIntersecting: true },
  ]);

  assert.deepEqual(actions, [[], [FULL_IMAGE_OBSERVER_ACTIONS.load], []]);
  assert.equal(instances[0].observed.has(elements[1]), false);
});

test("late slides reuse the active observer and reset on deactivation", () => {
  let instance;
  const controller = createFullImageObserverController({
    createObserver(callback) {
      instance = {
        callback,
        observed: new Set(),
        observe(element) {
          this.observed.add(element);
        },
        unobserve(element) {
          this.observed.delete(element);
        },
        disconnect() {
          this.observed.clear();
        },
      };
      return instance;
    },
  });
  const actions = [];
  const element = { id: "late" };

  controller.activate();
  const unregister = controller.register(element, (action) =>
    actions.push(action),
  );
  assert.equal(instance.observed.has(element), true);

  controller.deactivate();
  assert.deepEqual(actions, [FULL_IMAGE_OBSERVER_ACTIONS.reset]);
  assert.equal(instance.observed.size, 0);

  unregister();
  controller.activate();
  assert.equal(instance.observed.size, 0);
});
