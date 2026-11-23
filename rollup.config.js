/**
 * Builds the browser distro: one script per entry point that exposes it as
 * the global FlowableBpmnJS, in a development and a minified production
 * variant, plus the CSS and font assets a page needs.
 *
 *   dist/flowable-bpmn-modeler.development.js
 *   dist/flowable-bpmn-modeler.production.min.js
 *   dist/flowable-bpmn-viewer.development.js
 *   dist/flowable-bpmn-viewer.production.min.js
 *   dist/flowable-bpmn-navigated-viewer.development.js
 *   dist/flowable-bpmn-navigated-viewer.production.min.js
 *   dist/assets/diagram-js.css, bpmn-js.css, bpmn-font/, properties-panel.css,
 *     flowable-bpmn-js.css
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const ENTRIES = [
  [ 'Modeler', 'flowable-bpmn-modeler' ],
  [ 'Viewer', 'flowable-bpmn-viewer' ],
  [ 'NavigatedViewer', 'flowable-bpmn-navigated-viewer' ]
];

const ASSETS = [
  [ 'bpmn-js', 'dist/assets/diagram-js.css', 'diagram-js.css' ],
  [ 'bpmn-js', 'dist/assets/bpmn-js.css', 'bpmn-js.css' ],
  [ 'bpmn-js', 'dist/assets/bpmn-font', 'bpmn-font' ],
  [ '@bpmn-io/properties-panel', 'dist/assets/properties-panel.css', 'properties-panel.css' ],
  [ null, 'assets/flowable-bpmn-js.css', 'flowable-bpmn-js.css' ]
];

const BANNER = `/*! ${ pkg.name } ${ pkg.version } | MIT | bpmn-js (c) Camunda Services GmbH, bpmn.io license; keep the bpmn.io watermark visible */`;


export default ENTRIES.flatMap(([ entry, file ], index) => [ false, true ].map(minify => ({
  input: path.join(ROOT, 'lib', 'distro', `${ entry }.js`),
  output: {
    file: path.join(ROOT, 'dist', `${ file }.${ minify ? 'production.min' : 'development' }.js`),
    format: 'iife',
    name: 'FlowableBpmnJS',
    banner: BANNER,
    sourcemap: !minify
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    ...(minify ? [ terser({ format: { comments: /^!/ } }) ] : []),
    ...(index === 0 && !minify ? [ copyAssets() ] : [])
  ],
  onwarn(warning, warn) {

    // bpmn-js and diagram-js use circular imports on purpose
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }

    warn(warning);
  }
})));


/**
 * Copies the CSS and font assets into dist/assets.
 */
function copyAssets() {
  return {
    name: 'copy-assets',
    writeBundle() {
      for (const [ name, from, to ] of ASSETS) {
        const target = path.join(ROOT, 'dist', 'assets', to);

        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(path.join(name ? packageDir(name) : ROOT, from), target, { recursive: true });
      }
    }
  };
}

/**
 * The folder of an installed package: in this package's node_modules, or in
 * a parent's, as in the bpmn-js-env workspace.
 */
function packageDir(name) {
  for (let dir = ROOT; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', name);

    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }

    if (path.dirname(dir) === dir) {
      throw new Error(`cannot find the package ${ name }`);
    }
  }
}
