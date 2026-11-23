import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modeler, TouchModule } from '../index.js';

import { cleanUp, create } from './helper.js';

import xml from './fixtures/tasks.bpmn?raw';

// the palette and the context pad need their CSS to have a size to touch
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import '../assets/flowable-bpmn-js.css';


let nextId = 1;

/**
 * A touch screen: the module turns itself on only where (pointer: coarse)
 * matches, which a desktop browser doesn't.
 */
function fakeTouchScreen() {
  const matchMedia = window.matchMedia.bind(window);

  vi.spyOn(window, 'matchMedia').mockImplementation(query => {
    if (query === '(pointer: coarse)') {
      return {
        matches: true,
        media: query,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {}
      };
    }

    return matchMedia(query);
  });
}

function point(element) {
  const box = element.getBoundingClientRect();

  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function createTouch(target, position, identifier) {
  return new Touch({
    identifier,
    target,
    clientX: position.x,
    clientY: position.y,
    pageX: position.x,
    pageY: position.y,
    screenX: position.x,
    screenY: position.y
  });
}

function fire(target, type, touches, changed) {
  target.dispatchEvent(new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches,
    targetTouches: touches,
    changedTouches: changed || touches
  }));
}

/**
 * A finger that goes down on target, moves in steps, and lifts.
 */
function finger(target, start) {
  const id = nextId++;

  let position = start;
  let current = createTouch(target, position, id);

  fire(target, 'touchstart', [ current ]);

  return {
    touch: () => current,
    moveBy(dx, dy, steps = 5, others = []) {
      const from = position;

      for (let i = 1; i <= steps; i++) {
        position = { x: from.x + dx * i / steps, y: from.y + dy * i / steps };
        current = createTouch(target, position, id);

        fire(target, 'touchmove', [ current, ...others.map(other => other.touch()) ], [ current ]);
      }
    },
    lift(others = []) {
      fire(target, 'touchend', others.map(other => other.touch()), [ current ]);
    }
  };
}

function tap(target) {
  finger(target, point(target)).lift();
}


describe('touch', function() {

  let modeler;

  const get = name => modeler.get(name);
  const element = id => get('elementRegistry').get(id);
  const hit = id => get('elementRegistry').getGraphics(id).querySelector('.djs-hit');

  async function open() {
    ({ instance: modeler } = create(Modeler, { additionalModules: [ TouchModule ] }));

    await modeler.importXML(xml);
  }

  afterEach(cleanUp);


  describe('on a touch screen', function() {

    beforeEach(async function() {
      fakeTouchScreen();

      await open();
    });

    afterEach(function() {
      vi.restoreAllMocks();
    });


    it('selects a shape with a tap', function() {

      // when
      tap(hit('UserTask_1'));

      // then
      expect(get('selection').get()).toEqual([ element('UserTask_1') ]);
    });


    it('moves a shape with a drag', function() {

      // given
      const task = element('UserTask_1');
      const { x, y } = task;
      const target = hit('UserTask_1');

      // when
      const touch = finger(target, point(target));

      touch.moveBy(60, 40, 10);
      touch.lift();

      // then
      expect(task.x).toBeCloseTo(x + 60, -0.5);
      expect(task.y).toBeCloseTo(y + 40, -0.5);
    });


    it('pans the canvas with one finger on empty space', function() {

      // given
      const svg = get('canvas')._svg;
      const box = svg.getBoundingClientRect();
      const before = get('canvas').viewbox();

      // when
      const touch = finger(svg, { x: box.right - 20, y: box.bottom - 20 });

      touch.moveBy(-80, -50, 10);
      touch.lift();

      // then
      const after = get('canvas').viewbox();

      expect(after.x - before.x).toBeCloseTo(80, -0.5);
      expect(after.y - before.y).toBeCloseTo(50, -0.5);
    });


    it('zooms with a pinch', function() {

      // given
      const svg = get('canvas')._svg;
      const box = svg.getBoundingClientRect();
      const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const zoom = get('canvas').zoom();

      // when two fingers move apart
      const first = finger(svg, { x: centre.x - 40, y: centre.y });

      const id = nextId++;
      const start = { x: centre.x + 40, y: centre.y };

      let second = createTouch(svg, start, id);

      fire(svg, 'touchstart', [ first.touch(), second ], [ second ]);

      for (let i = 1; i <= 5; i++) {
        second = createTouch(svg, { x: start.x + 80 * i / 5, y: start.y }, id);
        fire(svg, 'touchmove', [ first.touch(), second ], [ second ]);
      }

      fire(svg, 'touchend', [ first.touch() ], [ second ]);
      first.lift();

      // then
      expect(get('canvas').zoom()).toBeGreaterThan(zoom * 1.2);
    });


    it('edits a label with a double tap', function() {

      // given
      const target = hit('UserTask_1');

      // when
      tap(target);
      tap(target);

      // then
      expect(get('directEditing').isActive()).toBe(true);
      expect(get('directEditing')._active.element).toBe(element('UserTask_1'));
    });


    it('finishes a label edit with a tap on the canvas', function() {

      // given
      const target = hit('UserTask_1');

      tap(target);
      tap(target);

      expect(get('directEditing').isActive()).toBe(true);

      // when
      const svg = get('canvas')._svg;
      const box = svg.getBoundingClientRect();

      finger(svg, { x: box.right - 20, y: box.bottom - 20 }).lift();

      // then
      expect(get('directEditing').isActive()).toBe(false);
    });

  });


  describe('connecting and creating on a touch screen', function() {

    beforeEach(async function() {
      fakeTouchScreen();

      await open();
    });

    afterEach(function() {
      vi.restoreAllMocks();
    });


    it('connects two tasks by dragging from the context pad', async function() {

      // given
      tap(hit('UserTask_1'));

      // as a person does, past the double tap time
      await new Promise(resolve => setTimeout(resolve, 400));

      const entry = document.querySelector('.djs-context-pad [data-action="connect"]');

      expect(entry).not.toBeNull();

      const target = hit('HttpTask');
      const from = point(entry);
      const to = point(target);

      // when
      const touch = finger(entry, from);

      touch.moveBy(to.x - from.x, to.y - from.y, 10);
      touch.lift();

      // then
      const flows = element('UserTask_1').outgoing;

      expect(flows).toHaveLength(1);
      expect(flows[0].type).toBe('bpmn:SequenceFlow');
      expect(flows[0].target).toBe(element('HttpTask'));
    });


    it('creates a typed task by dragging from the palette', function() {

      // given
      const entry = document.querySelector('.djs-palette [data-action="create.flowable-mail-task"]');
      const svg = get('canvas')._svg;
      const box = svg.getBoundingClientRect();
      const from = point(entry);
      const to = {
        x: Math.min(box.right, window.innerWidth) - 100,
        y: Math.min(box.bottom, window.innerHeight) - 80
      };

      const before = get('elementRegistry').filter(shape => shape.type === 'bpmn:ServiceTask').length;

      // when
      const touch = finger(entry, from);

      touch.moveBy(to.x - from.x, to.y - from.y, 10);
      touch.lift();

      // then
      const tasks = get('elementRegistry').filter(shape => shape.type === 'bpmn:ServiceTask');

      expect(tasks).toHaveLength(before + 1);
      expect(tasks.some(task => task.businessObject.get('flowable:type') === 'mail' && task.id !== 'MailTask')).toBe(true);
    });

  });


  describe('with a mouse', function() {

    beforeEach(open);


    it('leaves the modeler as it is', function() {

      // given
      const viewbox = get('canvas').viewbox();

      // when touch events come where (pointer: coarse) doesn't match
      tap(hit('UserTask_1'));

      // then nothing handles them
      expect(get('selection').get()).toEqual([]);
      expect(get('canvas').viewbox()).toEqual(viewbox);
    });


    it('still selects with the mouse', function() {

      // when
      get('eventBus').fire('element.click', {
        element: element('UserTask_1'),
        originalEvent: new MouseEvent('click')
      });

      // then
      expect(get('selection').get()).toEqual([ element('UserTask_1') ]);
    });

  });


  it('is part of no default modeler', function() {

    // the module is optional: apps add it
    expect(Modeler.prototype._modules).not.toContain(TouchModule);
  });

});
