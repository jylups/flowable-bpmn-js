import { afterEach, describe, expect, it } from 'vitest';

import { Modeler, NavigatedViewer, Viewer } from '../index.js';

import { ICONS, toSvg } from '../lib/features/typed-tasks/icons.js';
import { TASK_TYPES } from '../lib/features/typed-tasks/TypedTasks.js';

import { cleanUp, create } from './helper.js';

import xml from './fixtures/tasks.bpmn?raw';
import iconsCss from '../assets/flowable-bpmn-js.css?raw';


function gfx(instance, id) {
  return instance.get('elementRegistry').getGraphics(id);
}

function icon(instance, id) {
  return gfx(instance, id).querySelector('.flowable-task-icon');
}


describe('typed task icons', function() {

  afterEach(cleanUp);


  it('has an original icon per type', function() {
    expect(Object.keys(ICONS).sort()).toEqual(TASK_TYPES.map(({ type }) => type).sort());
  });


  [ [ 'Modeler', Modeler ], [ 'Viewer', Viewer ], [ 'NavigatedViewer', NavigatedViewer ] ].forEach(([ name, Type ]) => {

    it(`draws typed tasks with their icon in the ${ name }`, async function() {

      // given
      const { instance } = create(Type);

      // when
      await instance.importXML(xml);

      // then
      expect(icon(instance, 'HttpTask').getAttribute('data-type')).toBe('http');
      expect(icon(instance, 'MailTask').getAttribute('data-type')).toBe('mail');
    });

  });


  it('draws other tasks as bpmn-js does', async function() {

    // given
    const { instance } = create(Modeler);

    // when
    await instance.importXML(xml);

    // then
    expect(icon(instance, 'ClassTask')).toBeNull();
    expect(icon(instance, 'UserTask_1')).toBeNull();
  });


  it('keeps the task frame, label and markers', async function() {

    // given
    const { instance } = create(Modeler);

    await instance.importXML(xml);

    // then
    const taskGfx = gfx(instance, 'HttpTask');

    expect(taskGfx.querySelector('rect')).not.toBeNull();
    expect(taskGfx.textContent).toContain('Call');
  });


  it('uses the element stroke color', async function() {

    // given
    const { instance } = create(Modeler);

    await instance.importXML(xml);

    const task = instance.get('elementRegistry').get('MailTask');

    // when
    instance.get('modeling').setColor(task, { stroke: '#0a7f3f' });

    // then
    // tiny-svg writes presentation attributes as styles
    expect(getComputedStyle(icon(instance, 'MailTask')).stroke).toBe('rgb(10, 127, 63)');
  });


  it('follows type changes', async function() {

    // given
    const { instance } = create(Modeler);

    await instance.importXML(xml);

    const task = instance.get('elementRegistry').get('ClassTask');

    // when
    instance.get('commandStack').execute('flowable.replaceWithTypedTask', {
      element: task,
      taskType: TASK_TYPES.find(({ type }) => type === 'dmn')
    });

    // then
    expect(icon(instance, 'ClassTask').getAttribute('data-type')).toBe('dmn');

    // when
    instance.get('commandStack').undo();

    // then
    expect(icon(instance, 'ClassTask')).toBeNull();
  });


  it('keeps the shape outline for connections and hit areas', async function() {

    // given
    const { instance } = create(Modeler);

    await instance.importXML(xml);

    // when
    const path = instance.get('graphicsFactory').getShapePath(instance.get('elementRegistry').get('HttpTask'));

    // then
    expect(path).toMatch(/^M/);
  });

});


describe('icon stylesheet', function() {

  it('has a class per icon', function() {
    TASK_TYPES.forEach(({ type }) => {
      expect(iconsCss).toContain(`.flowable-icon-${ type }::before`);
    });
  });


  it('matches the icons', function() {
    expect(iconsCss).toContain(encodeURIComponent(toSvg('mail', '#000')));
  });

});
