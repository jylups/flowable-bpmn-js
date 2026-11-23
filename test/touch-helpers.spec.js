import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TouchModule from '../lib/features/touch/index.js';
import { createInputTracker } from '../lib/features/touch/InputTracker.js';
import { nearestWaypoint } from '../lib/features/touch/TouchInteraction.js';
import TouchLabelEditing, { EDITOR_SELECTOR } from '../lib/features/touch/TouchLabelEditing.js';
import TouchContextPad, { TouchTargetKeeper, shouldCancelWaitingDrag } from '../lib/features/touch/TouchContextPad.js';


describe('touch helpers', function() {

  describe('module', function() {

    it('starts every touch service with the modeler', function() {
      expect(TouchModule.__init__).toEqual([
        'touchInteraction',
        'touchFix',
        'touchLabelEditing',
        'touchContextPad'
      ]);

      expect(TouchLabelEditing.$inject).toEqual([ 'eventBus', 'directEditing' ]);
      expect(TouchContextPad.$inject).toEqual([ 'eventBus', 'dragging', 'canvas' ]);
    });

  });


  describe('createInputTracker', function() {

    let target, tracker;

    function press(pointerType) {
      const event = new Event('pointerdown');

      event.pointerType = pointerType;
      target.dispatchEvent(event);
    }

    beforeEach(function() {
      target = document.createElement('div');
      tracker = createInputTracker(target);
    });

    afterEach(function() {
      tracker.destroy();
    });


    it('counts as touch until a pointer is pressed', function() {
      expect(tracker.isMouse()).toBe(false);
    });


    it('knows a mouse or trackpad press', function() {

      // when
      press('mouse');

      // then
      expect(tracker.isMouse()).toBe(true);
    });


    it('counts a finger or a pen as touch', function() {
      press('mouse');
      press('touch');
      expect(tracker.isMouse()).toBe(false);

      press('mouse');
      press('pen');
      expect(tracker.isMouse()).toBe(false);
    });


    it('stops listening when destroyed', function() {

      // when
      tracker.destroy();
      press('mouse');

      // then
      expect(tracker.isMouse()).toBe(false);
    });

  });


  describe('nearestWaypoint', function() {

    const waypoints = [ { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 } ];


    it('finds the waypoint a bendpoint handle sits on', function() {
      expect(nearestWaypoint(waypoints, { x: 100, y: 0 })).toBe(1);
    });


    it('finds the closest one when the point is off every waypoint', function() {
      expect(nearestWaypoint(waypoints, { x: 92, y: 70 })).toBe(2);
      expect(nearestWaypoint(waypoints, { x: 8, y: 5 })).toBe(0);
    });

  });


  describe('TouchLabelEditing', function() {

    let listeners, directEditing, container, editor;

    function setUp(active) {
      listeners = {};

      const eventBus = {
        on(event, callback) {
          listeners[event] = callback;
        }
      };

      directEditing = {
        isActive: vi.fn(() => active),
        complete: vi.fn()
      };

      container = document.createElement('div');
      editor = document.createElement('div');
      editor.className = EDITOR_SELECTOR.slice(1);
      editor.tabIndex = 0;
      container.appendChild(editor);
      document.body.appendChild(container);

      vi.spyOn(editor, 'focus');

      new TouchLabelEditing(eventBus, directEditing);

      listeners['canvas.init']({ svg: { parentElement: container } });
    }

    function touchend() {
      const event = new Event('touchend', { cancelable: true });

      container.dispatchEvent(event);

      return event;
    }

    afterEach(function() {
      container.remove();
    });


    it('finishes an open label edit when the canvas is tapped', function() {

      // given
      setUp(true);

      // when
      listeners['element.click']();

      // then
      expect(directEditing.complete).toHaveBeenCalledTimes(1);
    });


    it('does nothing on a tap when no label is being edited', function() {

      // given
      setUp(false);

      // when
      listeners['element.click']();

      // then
      expect(directEditing.complete).not.toHaveBeenCalled();
    });


    it('keeps the focus in the editor that the double tap opened', function() {

      // given
      setUp(true);

      // when
      listeners['directEditing.activate']();

      const event = touchend();

      // then
      expect(event.defaultPrevented).toBe(true);
      expect(editor.focus).toHaveBeenCalledTimes(1);
    });


    it('leaves other touches alone', function() {

      // given
      setUp(true);

      // then
      expect(touchend().defaultPrevented).toBe(false);

      listeners['directEditing.activate']();
      touchend();

      expect(touchend().defaultPrevented).toBe(false);
      expect(editor.focus).toHaveBeenCalledTimes(1);
    });

  });


  describe('TouchTargetKeeper', function() {

    let pad, entry, keeper;

    beforeEach(function() {
      vi.useFakeTimers();

      pad = document.createElement('div');
      entry = document.createElement('div');
      pad.appendChild(entry);
      document.body.appendChild(pad);

      keeper = new TouchTargetKeeper(document);
    });

    afterEach(function() {
      keeper.release();
      pad.remove();
      vi.useRealTimers();
    });


    it('puts the touched entry back in the page when the context pad removes it', function() {

      // given
      keeper.touchStarted(entry);
      pad.remove();
      expect(entry.isConnected).toBe(false);

      // when
      keeper.keep();

      // then
      expect(entry.isConnected).toBe(true);
      expect(entry.parentNode).not.toBe(pad);
    });


    it('leaves an entry that is still in the page where it is', function() {

      // when
      keeper.touchStarted(entry);
      keeper.keep();

      // then
      expect(entry.parentNode).toBe(pad);
    });


    it('takes the kept entry out of the page once the finger lifts', function() {

      // given
      keeper.touchStarted(entry);
      pad.remove();
      keeper.keep();

      // when
      entry.dispatchEvent(new Event('touchend'));

      // then
      expect(entry.isConnected).toBe(true);

      vi.advanceTimersByTime(1);

      expect(entry.isConnected).toBe(false);
    });


    it('keeps it again from a touchmove, for removals that do not close the context pad', function() {

      // given
      keeper.touchStarted(entry);
      pad.remove();

      // when
      entry.dispatchEvent(new Event('touchmove'));

      // then
      expect(entry.isConnected).toBe(true);
    });

  });


  describe('shouldCancelWaitingDrag', function() {

    const touchDrag = { isTouch: true };


    it('cancels a create started by a tap when the next touch is off the canvas', function() {
      expect(shouldCancelWaitingDrag(touchDrag, true, false)).toBe(true);
    });


    it('lets the next touch on the canvas place it', function() {
      expect(shouldCancelWaitingDrag(touchDrag, true, true)).toBe(false);
    });


    it('leaves drags started by a drag, mouse drags and no drag alone', function() {
      expect(shouldCancelWaitingDrag(touchDrag, false, false)).toBe(false);
      expect(shouldCancelWaitingDrag({ isTouch: false }, true, false)).toBe(false);
      expect(shouldCancelWaitingDrag(null, true, false)).toBe(false);
    });

  });

});
