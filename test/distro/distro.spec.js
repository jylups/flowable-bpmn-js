import { afterEach, describe, expect, it } from 'vitest';

import { cleanUp, create, nextFrame } from '../helper.js';

import xml from '../fixtures/activiti.bpmn?raw';
import dockersXml from '../fixtures/edge-dockers.bpmn?raw';

import modelerDevelopment from '../../dist/flowable-bpmn-modeler.development.js?raw';
import modelerProduction from '../../dist/flowable-bpmn-modeler.production.min.js?raw';
import viewerDevelopment from '../../dist/flowable-bpmn-viewer.development.js?raw';
import viewerProduction from '../../dist/flowable-bpmn-viewer.production.min.js?raw';
import navigatedViewerDevelopment from '../../dist/flowable-bpmn-navigated-viewer.development.js?raw';
import navigatedViewerProduction from '../../dist/flowable-bpmn-navigated-viewer.production.min.js?raw';

import bpmnJsCss from '../../dist/assets/bpmn-js.css?raw';
import diagramJsCss from '../../dist/assets/diagram-js.css?raw';
import fontCss from '../../dist/assets/bpmn-font/css/bpmn-embedded.css?raw';
import panelCss from '../../dist/assets/properties-panel.css?raw';
import iconsCss from '../../dist/assets/flowable-bpmn-js.css?raw';
import touchCss from '../../dist/assets/flowable-bpmn-js-touch.css?raw';
import lintCss from '../../dist/assets/bpmn-js-bpmnlint.css?raw';


/**
 * Runs a distro script as a page would and returns the global it sets.
 */
function load(code) {

  // a distro script declares the global with var, so it can be reset but not deleted
  window.FlowableBpmnJS = undefined;

  const script = document.createElement('script');

  script.textContent = code;
  document.head.appendChild(script);
  script.remove();

  return window.FlowableBpmnJS;
}


describe('browser distro', function() {

  afterEach(cleanUp);


  [
    [ 'development', modelerDevelopment ],
    [ 'production', modelerProduction ]
  ].forEach(([ variant, code ]) => {

    it(`modeler (${ variant }) edits Flowable models with the panel`, async function() {

      // given
      const Modeler = load(code);
      const { instance, panelParent } = create(Modeler, {}, { panel: true });

      // when
      await instance.importXML(xml);

      instance.get('selection').select(instance.get('elementRegistry').get('UserTask_1'));
      await nextFrame();

      // then
      expect(instance.get('elementRegistry').get('UserTask_1').businessObject.get('flowable:assignee')).toBe('${initiator}');
      expect(panelParent.querySelector('[data-group-id="group-flowable-assignment"]')).not.toBeNull();

      const { xml: saved } = await instance.saveXML();

      expect(saved).toContain('<error id="notFound" errorCode="notFound" />');
      expect(saved).not.toContain('xmlns:activiti');
      expect(instance.get('linting').isActive()).toBe(true);
    });

  });


  [
    [ 'viewer (development)', viewerDevelopment ],
    [ 'viewer (production)', viewerProduction ],
    [ 'navigated viewer (development)', navigatedViewerDevelopment ],
    [ 'navigated viewer (production)', navigatedViewerProduction ]
  ].forEach(([ name, code ]) => {

    it(`${ name } shows Flowable models`, async function() {

      // given
      const Viewer = load(code);
      const { instance } = create(Viewer);

      // when
      await instance.importXML(xml);

      // then
      expect(instance.get('elementRegistry').get('UserTask_1').businessObject.get('flowable:assignee')).toBe('${initiator}');
      expect(instance.get('modeling', false)).toBeFalsy();
    });

  });


  [
    [ 'modeler (development)', modelerDevelopment ],
    [ 'modeler (production)', modelerProduction ],
    [ 'viewer (development)', viewerDevelopment ],
    [ 'viewer (production)', viewerProduction ],
    [ 'navigated viewer (development)', navigatedViewerDevelopment ],
    [ 'navigated viewer (production)', navigatedViewerProduction ]
  ].forEach(([ name, code ]) => {

    it(`${ name } reads the edge dockers Flowable writes, without warnings`, async function() {

      // given
      const Constructor = load(code);
      const { instance } = create(Constructor);

      // when
      const { warnings } = await instance.importXML(dockersXml);

      // then
      expect(warnings.map(warning => warning.message)).toEqual([]);

      const edge = instance.get('elementRegistry').get('Flow').di;

      expect(edge.get('flowable:sourceDockerX')).toBe('15.0');
      expect(edge.get('flowable:targetDockerY')).toBe('14.0');
    });

  });


  it('ships the CSS and the font', function() {
    expect(diagramJsCss).toContain('.djs-container');
    expect(bpmnJsCss).toContain('.bjs-container');
    expect(fontCss).toContain('@font-face');
    expect(panelCss).toContain('.bio-properties-panel');
    expect(iconsCss).toContain('.flowable-icon-mail::before');
    expect(touchCss).toContain('(pointer: coarse)');
    expect(lintCss).toContain('.bjsl-');
  });

});
