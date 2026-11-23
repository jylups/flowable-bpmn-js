/**
 * Touch editing for the modeler, as an optional module:
 *
 *   import { Modeler, TouchModule } from '@jylups/flowable-bpmn-js';
 *   import '@jylups/flowable-bpmn-js/assets/flowable-bpmn-js-touch.css';
 *
 *   new Modeler({ additionalModules: [ TouchModule ] });
 *
 * It turns itself on only where (pointer: coarse) matches, so a desktop with
 * a mouse is unchanged. assets/flowable-bpmn-js-touch.css makes the touch
 * targets larger.
 *
 * The gestures come from bpmn-js-touch-interaction (MIT, see LICENSE in this
 * folder), as adapted in @jylups/cmmn-js; the other services fix what the
 * modeler needs on top of them.
 */
import {
  InteractionEventsModule,
  TouchFix,
  TouchInteraction
} from './TouchInteraction.js';

import TouchContextPad from './TouchContextPad.js';
import TouchLabelEditing from './TouchLabelEditing.js';

export default {
  __depends__: [
    InteractionEventsModule
  ],
  __init__: [
    'touchInteraction',
    'touchFix',
    'touchLabelEditing',
    'touchContextPad'
  ],
  touchInteraction: [ 'type', TouchInteraction ],
  touchFix: [ 'type', TouchFix ],
  touchLabelEditing: [ 'type', TouchLabelEditing ],
  touchContextPad: [ 'type', TouchContextPad ]
};
