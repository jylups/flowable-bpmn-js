/**
 * Icons of the typed service tasks, drawn for this project on a 24 x 24
 * grid as outlines (stroke only, round caps and joins). Each icon is a list
 * of SVG elements: [ tag, attributes ].
 *
 * The task renderer draws them on the canvas; assets/flowable-bpmn-js.css
 * (generated from here by `npm run icons`) shows them in the palette and the
 * replace menu.
 */
export const ICONS = {

  // an envelope
  mail: [
    [ 'rect', { x: 3, y: 6, width: 18, height: 12, rx: 1.5 } ],
    [ 'path', { d: 'M3.5 7 L12 13 L20.5 7' } ]
  ],

  // a globe
  http: [
    [ 'circle', { cx: 12, cy: 12, r: 8.5 } ],
    [ 'path', { d: 'M3.5 12 H20.5' } ],
    [ 'path', { d: 'M12 3.5 C8.4 7 8.4 17 12 20.5 C15.6 17 15.6 7 12 3.5' } ]
  ],

  // a terminal prompt
  shell: [
    [ 'rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 } ],
    [ 'path', { d: 'M7 9.5 L10 12 L7 14.5' } ],
    [ 'path', { d: 'M12 15 H16.5' } ]
  ],

  // a route between two endpoints
  camel: [
    [ 'circle', { cx: 6, cy: 6.5, r: 2.2 } ],
    [ 'circle', { cx: 18, cy: 17.5, r: 2.2 } ],
    [ 'path', { d: 'M8.2 6.5 H13 C16.2 6.5 16.2 12 12 12 C7.8 12 7.8 17.5 11 17.5 H15.8' } ]
  ],

  // a decision table
  dmn: [
    [ 'rect', { x: 3.5, y: 5, width: 17, height: 14, rx: 1 } ],
    [ 'path', { d: 'M3.5 9.5 H20.5' } ],
    [ 'path', { d: 'M3.5 14.25 H20.5' } ],
    [ 'path', { d: 'M9.5 9.5 V19' } ]
  ],

  // a briefcase
  case: [
    [ 'rect', { x: 3.5, y: 8, width: 17, height: 11, rx: 1.5 } ],
    [ 'path', { d: 'M9 8 V6.2 C9 5.5 9.5 5 10.2 5 H13.8 C14.5 5 15 5.5 15 6.2 V8' } ],
    [ 'path', { d: 'M3.5 12.5 H20.5' } ]
  ],

  // a signal sent out
  'send-event': [
    [ 'circle', { cx: 12, cy: 12, r: 1.8 } ],
    [ 'path', { d: 'M8.6 8.6 C6.7 10.5 6.7 13.5 8.6 15.4' } ],
    [ 'path', { d: 'M15.4 8.6 C17.3 10.5 17.3 13.5 15.4 15.4' } ],
    [ 'path', { d: 'M5.6 5.6 C2.1 9.1 2.1 14.9 5.6 18.4' } ],
    [ 'path', { d: 'M18.4 5.6 C21.9 9.1 21.9 14.9 18.4 18.4' } ]
  ],

  // work handed out of the process
  'external-worker': [
    [ 'path', { d: 'M14 4.5 H19.5 V10' } ],
    [ 'path', { d: 'M19.5 4.5 L11 13' } ],
    [ 'path', { d: 'M17 13.5 V18.5 C17 19.1 16.6 19.5 16 19.5 H5.5 C4.9 19.5 4.5 19.1 4.5 18.5 V8 C4.5 7.4 4.9 7 5.5 7 H10.5' } ]
  ]
};

/**
 * Stroke attributes shared by all icons.
 */
export const ICON_STYLE = {
  fill: 'none',
  'stroke-width': 1.5,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
};

/**
 * An icon as standalone SVG markup.
 *
 * @param {string} type - e.g. 'mail'
 * @param {string} [color='currentColor']
 *
 * @return {string}
 */
export function toSvg(type, color = 'currentColor') {
  const style = { ...ICON_STYLE, stroke: color };

  const body = ICONS[type].map(([ tag, attrs ]) => `<${ tag }${ toAttrs(attrs) }/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${ toAttrs(style) }>${ body }</svg>`;
}

function toAttrs(attrs) {
  return Object.entries(attrs).map(([ name, value ]) => ` ${ name }="${ value }"`).join('');
}
