/**
 * Current scroll motion-blur radius, in px.
 *
 * Most blocks pick this up through the `--scroll-blur` custom property and
 * the `.motion-blur` class. The project card stack can't: its scroll handler
 * writes `filter` inline every frame and would clobber a CSS filter, so it
 * reads the number from here and composes it into its own filter string.
 */
export const scrollBlur = { value: 0 };

export default scrollBlur;
