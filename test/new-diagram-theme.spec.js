import { afterEach, describe, expect, it } from 'vitest';

import {
  FLOWABLE_TARGET_NAMESPACE,
  Modeler,
  NavigatedViewer,
  THEME_COLORS,
  Viewer,
  createNewDiagramXML
} from '../index.js';

import { cleanUp, create } from './helper.js';

import xml from './fixtures/tasks.bpmn?raw';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import '../assets/flowable-bpmn-js.css';


function processOf(instance) {
  return instance.get('canvas').getRootElement().businessObject;
}


describe('new diagram', function() {

  afterEach(cleanUp);


  it('opens an executable Flowable process', async function() {

    // given
    const { instance } = create(Modeler);

    // when
    const { warnings } = await instance.createDiagram();

    // then
    expect(warnings).toEqual([]);

    const process = processOf(instance);

    expect(process.$type).toBe('bpmn:Process');
    expect(process.get('isExecutable')).toBe(true);
    expect(process.get('id')).toMatch(/^Process_[a-z0-9]+$/);
    expect(process.$parent.get('targetNamespace')).toBe(FLOWABLE_TARGET_NAMESPACE);
    expect(instance.get('elementRegistry').filter(element => element.type === 'bpmn:StartEvent')).toHaveLength(1);
  });


  it('saves the process and the Flowable namespace once it is used', async function() {

    // given
    const { instance } = create(Modeler);

    await instance.createDiagram({ processId: 'invoice', processName: 'Invoice' });

    // when
    const startEvent = instance.get('elementRegistry').get('StartEvent_1');

    instance.get('modeling').updateProperties(startEvent, { 'flowable:initiator': 'initiator' });

    const { xml: saved } = await instance.saveXML();

    // then
    expect(saved).toContain('<process id="invoice" name="Invoice" isExecutable="true">');
    expect(saved).toContain('xmlns:flowable="http://flowable.org/bpmn"');
    expect(saved).toContain('flowable:initiator="initiator"');
  });


  it('takes a process key and name', function() {

    // when
    const result = createNewDiagramXML({ processId: 'order-handling', processName: 'Orders & <returns>' });

    // then
    expect(result).toContain('<process id="order-handling" name="Orders &amp; &lt;returns&gt;" isExecutable="true">');
    expect(result).toContain('bpmnElement="order-handling"');
  });


  it('refuses an invalid process key', function() {
    expect(() => createNewDiagramXML({ processId: '1 order' })).toThrow(/invalid process id/);
  });


  it('gives each new process its own key', function() {

    // when
    const first = /process id="([^"]+)"/.exec(createNewDiagramXML())[1];
    const second = /process id="([^"]+)"/.exec(createNewDiagramXML())[1];

    // then
    expect(first).not.toBe(second);
  });

});


describe('theme hooks', function() {

  afterEach(cleanUp);


  async function open(Type = Modeler, options) {
    const { instance, container } = create(Type, options);

    await instance.importXML(xml);

    const visual = id => instance.get('elementRegistry').getGraphics(id).querySelector('.djs-visual');

    return { instance, container, visual };
  }


  it('draws with bpmn-js colors by default', async function() {

    // when
    const { visual } = await open();

    // then
    const rect = getComputedStyle(visual('UserTask_1').querySelector('rect'));

    expect(rect.fill).toBe('rgb(255, 255, 255)');
    expect(rect.stroke).toBe('rgb(34, 36, 42)');
  });


  [ [ 'Modeler', Modeler ], [ 'Viewer', Viewer ], [ 'NavigatedViewer', NavigatedViewer ] ].forEach(([ name, Type ]) => {

    it(`follows the CSS custom properties in the ${ name }`, async function() {

      // given
      const { container, visual } = await open(Type);

      // when
      container.style.setProperty('--flowable-shape-fill', 'rgb(30, 32, 38)');
      container.style.setProperty('--flowable-shape-stroke', 'rgb(220, 222, 228)');
      container.style.setProperty('--flowable-label-color', 'rgb(250, 200, 100)');

      // then
      const task = visual('UserTask_1');

      expect(getComputedStyle(task.querySelector('rect')).fill).toBe('rgb(30, 32, 38)');
      expect(getComputedStyle(task.querySelector('rect')).stroke).toBe('rgb(220, 222, 228)');
      expect(getComputedStyle(task.querySelector('text')).fill).toBe('rgb(250, 200, 100)');
    });

  });


  it('colors the typed task icons with the stroke', async function() {

    // given
    const { container, visual } = await open();

    // when
    container.style.setProperty('--flowable-shape-stroke', 'rgb(220, 222, 228)');

    // then
    expect(getComputedStyle(visual('HttpTask').parentNode.querySelector('.flowable-task-icon')).stroke).toBe('rgb(220, 222, 228)');
  });


  it('keeps colors set on an element', async function() {

    // given
    const { instance, container, visual } = await open();

    container.style.setProperty('--flowable-shape-fill', 'rgb(30, 32, 38)');

    // when
    instance.get('modeling').setColor(instance.get('elementRegistry').get('UserTask_1'), { fill: '#bbdefb' });

    // then
    expect(getComputedStyle(visual('UserTask_1').querySelector('rect')).fill).toBe('rgb(187, 222, 251)');
  });


  it('keeps renderer colors an app sets', async function() {

    // when
    const { visual } = await open(Modeler, { bpmnRenderer: { defaultFillColor: 'rgb(255, 250, 200)' } });

    // then
    expect(getComputedStyle(visual('UserTask_1').querySelector('rect')).fill).toBe('rgb(255, 250, 200)');
  });


  it('exports SVG that falls back to the default colors', async function() {

    // given
    const { instance } = await open();

    // when
    const { svg } = await instance.saveSVG();

    // then
    expect(svg).toContain(THEME_COLORS.defaultFillColor);
  });


  [ [ 'Modeler', Modeler ], [ 'Viewer', Viewer ], [ 'NavigatedViewer', NavigatedViewer ] ].forEach(([ name, Type ]) => {

    it(`keeps the bpmn.io watermark visible in the ${ name }`, async function() {

      // when
      const { container } = await open(Type);

      // then
      const watermark = container.querySelector('.bjs-powered-by');

      expect(watermark).not.toBeNull();
      expect(getComputedStyle(watermark).display).not.toBe('none');
      expect(getComputedStyle(watermark).visibility).toBe('visible');
      expect(watermark.getAttribute('href')).toMatch(/^https?:\/\/bpmn\.io/);
    });

  });


  it('keeps the watermark color of bpmn-js by default', async function() {

    // when
    const { container } = await open();

    // then
    expect(getComputedStyle(container.querySelector('.bjs-powered-by')).color).toBe('rgb(64, 64, 64)');
  });


  it('lets a dark theme keep the watermark readable', async function() {

    // given
    const { container } = await open();

    // when
    container.style.setProperty('--flowable-watermark-color', 'rgb(200, 202, 208)');

    // then
    expect(getComputedStyle(container.querySelector('.bjs-powered-by')).color).toBe('rgb(200, 202, 208)');
  });

});
