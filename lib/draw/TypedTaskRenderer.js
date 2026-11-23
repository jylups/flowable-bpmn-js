import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { getStrokeColor } from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

import { ICONS, ICON_STYLE } from '../features/typed-tasks/icons.js';
import { getTypedTask } from '../features/typed-tasks/TypedTasks.js';

/**
 * Above the BpmnRenderer, so typed service tasks are drawn here.
 */
const HIGH_PRIORITY = 1500;

/**
 * Icon size and place, as bpmn-js places its task type icons.
 */
const ICON_SIZE = 18;
const ICON_OFFSET = 5;


/**
 * Draws a typed service task as a task with its type's icon in the top left
 * corner, instead of the service task gear.
 */
export default class TypedTaskRenderer extends BaseRenderer {

  constructor(config, eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this._bpmnRenderer = bpmnRenderer;
    this._defaultStrokeColor = config && config.defaultStrokeColor;
  }

  canRender(element) {
    return !element.labelTarget && !!getTypedTask(element);
  }

  drawShape(parentGfx, element, attrs) {
    const shape = this._bpmnRenderer.handlers['bpmn:Task'](parentGfx, element, attrs);

    this._drawIcon(parentGfx, element, attrs);

    return shape;
  }

  getShapePath(element) {
    return this._bpmnRenderer.getShapePath(element);
  }

  _drawIcon(parentGfx, element, attrs = {}) {
    const { type } = getTypedTask(element);
    const scale = ICON_SIZE / 24;

    const group = svgCreate('g');

    svgClasses(group).add('flowable-task-icon');
    svgAttr(group, {
      'data-type': type,
      transform: `translate(${ ICON_OFFSET }, ${ ICON_OFFSET }) scale(${ scale })`,
      ...ICON_STYLE,
      stroke: getStrokeColor(element, this._defaultStrokeColor, attrs.stroke)
    });

    ICONS[type].forEach(([ tag, iconAttrs ]) => {
      const node = svgCreate(tag);

      svgAttr(node, iconAttrs);
      svgAppend(group, node);
    });

    svgAppend(parentGfx, group);
  }
}

TypedTaskRenderer.$inject = [ 'config.bpmnRenderer', 'eventBus', 'bpmnRenderer' ];
