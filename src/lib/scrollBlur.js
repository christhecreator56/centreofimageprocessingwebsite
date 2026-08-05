/**
 * Scroll motion-blur amount, in px, plus a tiny pub/sub around it.
 *
 * Most blocks read this through the `--scroll-blur` custom property and the
 * `.motion-blur` class. The project card stack can't: its scroll handler
 * writes `filter` inline every frame and would clobber a CSS filter, so it
 * subscribes here instead.
 *
 * The subscription exists so there is exactly ONE requestAnimationFrame loop
 * driving the blur. Previously each consumer ran its own permanent loop, which
 * meant frames were being scheduled forever even on a page nobody was
 * touching.
 */
const listeners = new Set();

export const scrollBlur = {
  value: 0,

  set(v) {
    if (v === this.value) return;
    this.value = v;
    listeners.forEach((fn) => fn(v));
  },

  /** Returns an unsubscribe function. */
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export default scrollBlur;
