/**
 * Theme hooks: the renderers' default colors are CSS custom properties, so
 * a page can restyle shapes and labels with CSS only, for example for a
 * dark theme. Their fallbacks are bpmn-js' own defaults, so nothing changes
 * when they aren't set, and SVG exports use the fallbacks.
 *
 *   --flowable-shape-fill     shape fill (white)
 *   --flowable-shape-stroke   shape outline, connections and icons
 *   --flowable-label-color    label text (the stroke color by default)
 *
 * Colors set on single elements (color picker, bioc:fill) still win. An app
 * that passes its own `bpmnRenderer` colors keeps them.
 */
export const THEME_COLORS = {
  defaultFillColor: 'var(--flowable-shape-fill, white)',
  defaultStrokeColor: 'var(--flowable-shape-stroke, hsl(225, 10%, 15%))',
  defaultLabelColor: 'var(--flowable-label-color, var(--flowable-shape-stroke, hsl(225, 10%, 15%)))'
};

/**
 * Constructor options with the theme colors as `bpmnRenderer` defaults.
 *
 * @param {Object} [options]
 *
 * @return {Object}
 */
export function withThemeColors(options = {}) {
  return {
    ...options,
    bpmnRenderer: { ...THEME_COLORS, ...options.bpmnRenderer }
  };
}
