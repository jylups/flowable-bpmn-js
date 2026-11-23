import { afterEach, describe, expect, it } from 'vitest';

import { Linter } from 'bpmnlint';

import { Modeler, createFlowableLinterConfig, flowableLintConfig } from '../index.js';

import { isCron, isRepeatingInterval } from '../lib/lint/values.js';

import { cleanUp, create, nextFrame } from './helper.js';

import xml from './fixtures/lint.bpmn?raw';


/**
 * Lints the fixture with the Flowable rules and returns the issues as
 * { id: [ 'rule: message' ] }.
 */
async function lint() {
  const { instance } = create(Modeler, { linting: { active: false } });
  const { rootElement } = await instance.get('moddle').fromXML(xml, 'bpmn:Definitions');

  const results = await new Linter(createFlowableLinterConfig()).lint(rootElement);
  const issues = {};

  Object.entries(results).forEach(([ rule, reports ]) => {
    reports.forEach(({ id, message }) => {
      (issues[id] = issues[id] || []).push(`${ rule }: ${ message }`);
    });
  });

  return issues;
}

/**
 * Waits for the next lint result of a modeler.
 */
function nextLint(instance) {
  return new Promise(resolve => instance.on('linting.completed', ({ issues }) => resolve(issues)));
}


describe('lint rules', function() {

  afterEach(cleanUp);


  it('reports exactly the invalid elements', async function() {

    // when
    const issues = await lint();

    // then
    expect(Object.keys(issues).sort()).toEqual([
      'BadDueDate',
      'BadDuration',
      'BadEndDate',
      'BadRetry',
      'EmptyTimer',
      'HttpNoUrl',
      'NoCalledElement',
      'NoImplementation',
      'WorkerNoTopic'
    ]);
  });


  it('reports a service task without implementation', async function() {
    expect((await lint()).NoImplementation).toEqual([
      'flowable/service-task-implementation: Service task has no implementation: set a Java class, an expression, a delegate expression or a type'
    ]);
  });


  it('reports what a typed task needs', async function() {

    // when
    const issues = await lint();

    // then
    expect(issues.HttpNoUrl).toEqual([ 'flowable/service-task-implementation: HTTP task has no request URL' ]);
    expect(issues.WorkerNoTopic).toEqual([ 'flowable/service-task-implementation: External worker task has no topic' ]);
    expect(issues.HttpTask).toBeUndefined();
    expect(issues.MailTask).toBeUndefined();
  });


  it('reports invalid dates, durations and cycles', async function() {

    // when
    const issues = await lint();

    // then
    expect(issues.BadDueDate).toEqual([ 'flowable/valid-durations: Due date must be an ISO 8601 date or duration, for example P2DT4H' ]);
    expect(issues.BadDuration).toEqual([ 'flowable/valid-durations: Timer duration must be an ISO 8601 duration, for example PT15M' ]);
    expect(issues.BadEndDate).toEqual([ 'flowable/valid-durations: Timer cycle end date must be an ISO 8601 date, for example 2026-12-31T17:00:00' ]);
    expect(issues.EmptyTimer).toEqual([ 'flowable/valid-durations: Timer has no date, duration or cycle' ]);
    expect(issues.BadRetry).toEqual([ 'flowable/valid-durations: Retry time cycle must be an ISO 8601 repeating interval, for example R5/PT10M' ]);
  });


  it('accepts durations, dates, cycles, cron and expressions', async function() {

    // when
    const issues = await lint();

    // then
    [ 'DueDuration', 'DueExpression', 'CronCycle', 'IsoCycle', 'GoodRetry' ].forEach(id => {
      expect(issues[id], id).toBeUndefined();
    });
  });


  it('reports a call activity without called element', async function() {
    expect((await lint()).NoCalledElement).toEqual([ 'flowable/called-element: Call activity has no called element' ]);
  });


  describe('values', function() {

    it('knows repeating intervals', function() {
      expect(isRepeatingInterval('R3/PT1H')).toBe(true);
      expect(isRepeatingInterval('R/PT10M')).toBe(true);
      expect(isRepeatingInterval('R2/2026-12-31T08:00/P1D')).toBe(true);
      expect(isRepeatingInterval('R5/P1D/2027-01-01')).toBe(true);
      expect(isRepeatingInterval('R5/P1D/P2D')).toBe(false);
      expect(isRepeatingInterval('PT1H')).toBe(false);
    });


    it('knows cron expressions', function() {
      expect(isCron('0 0/5 * * * ?')).toBe(true);
      expect(isCron('0 15 10 ? * MON-FRI 2027')).toBe(true);
      expect(isCron('every day')).toBe(false);
    });

  });

});


describe('linting in the modeler', function() {

  afterEach(cleanUp);


  it('lints with the Flowable rules and shows the issues', async function() {

    // given
    const { instance, container } = create(Modeler);
    const linted = nextLint(instance);

    // when
    await instance.importXML(xml);

    const issues = await linted;
    await nextFrame();

    // then
    expect(issues.NoCalledElement[0].message).toBe('Call activity has no called element');
    expect(issues.NoCalledElement[0].category).toBe('error');
    expect(instance.get('linting').isActive()).toBe(true);
    expect(container.querySelectorAll('.bjsl-overlay').length).toBeGreaterThan(0);
  });


  it('lints again after a change', async function() {

    // given
    const { instance } = create(Modeler);
    const first = nextLint(instance);

    await instance.importXML(xml);
    await first;

    // when
    const again = nextLint(instance);

    instance.get('modeling').updateProperties(instance.get('elementRegistry').get('NoCalledElement'), { calledElement: 'invoice' });

    // then
    expect((await again).NoCalledElement).toBeUndefined();
  });


  it('can start with the issues hidden', async function() {

    // given
    const { instance, container } = create(Modeler, { linting: { active: false } });

    // when
    await instance.importXML(xml);
    await nextFrame();

    // then
    expect(instance.get('linting').isActive()).toBe(false);
    expect(container.querySelectorAll('.bjsl-overlay')).toHaveLength(0);
  });


  it('takes another linter configuration', async function() {

    // given
    const { instance } = create(Modeler, {
      linting: {
        bpmnlint: createFlowableLinterConfig({ rules: { 'flowable/called-element': 'warn' } })
      }
    });

    const linted = nextLint(instance);

    // when
    await instance.importXML(xml);

    // then
    const issues = await linted;

    expect(Object.keys(issues)).toEqual([ 'NoCalledElement' ]);
    expect(issues.NoCalledElement[0].category).toBe('warn');
  });


  it('exports the default configuration', function() {
    expect(flowableLintConfig.rules).toEqual({
      'flowable/called-element': 'error',
      'flowable/service-task-implementation': 'error',
      'flowable/valid-durations': 'error'
    });
  });

});
