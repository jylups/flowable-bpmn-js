# @jylups/flowable-bpmn-js

bpmn-js modeler and viewer with the Flowable BPMN extensions.

> Work in progress. This package is being built in Phase 4 of the Flowable BPMN editor ([jylups/bpmn-js-env#39](https://github.com/jylups/bpmn-js-env/issues/39)). It is not published yet.

## Licence note

bpmn-js requires the bpmn.io watermark to stay visible in rendered diagrams. This package keeps it.

## Development

Work in the [bpmn-js-env](https://github.com/jylups/bpmn-js-env) workspace, which links this package with the others and with the playground. Issues for this package are tracked there.

```sh
npm install
npm run lint
npm test
```

The tests run in headless Chromium through Playwright. Either install Playwright's Chromium once with `npx playwright install chromium`, or use an installed Google Chrome with `TEST_BROWSER_CHANNEL=chrome npm test`.

## License

MIT
