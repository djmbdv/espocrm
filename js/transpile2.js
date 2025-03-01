/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2025 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

const {Transpiler} = require('espo-frontend-build-tools');
const { Worker } = require('worker_threads');
const { resolve } = require('path');
// Display help message if requested or if no file is specified
const helpFlags = ['-h', '--help'];
if (process.argv.some(arg => helpFlags.includes(arg))) {
    console.log('Usage: node transpile.js -f <file>');
    process.exit(0);
}

// Ensure the file parameter is provided


// Log environment details for debugging purposes
let file;

let fIndex = process.argv.findIndex(item => item === '-f');

if (fIndex > 0) {
    file = process.argv.at(fIndex + 1);

    if (!file) {
        throw new Error(`No file specified.`);
    }
}

const transpiler1 = new Transpiler({
    file: file,
});

const transpiler2 = new Transpiler({
    mod: 'crm',
    path: 'client/modules/crm',
    file: file,
});

console.log(`Transpiling ${file}...`);

function runWorker(data) {
    return new Promise((resolveWorker, rejectWorker) => {
        // Update the path below to match the actual location of transpileWorker.js
        const worker = new Worker(resolve(__dirname, './transpileWorker.js'), { workerData: data });
        worker.once('message', resolveWorker);
        worker.once('error', rejectWorker);
        worker.once('exit', code => {
            if (code !== 0) {
                rejectWorker(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

transpiler1.process = () => runWorker({ file, mod: null, path: null });
transpiler2.process = () => runWorker({ file, mod: 'crm', path: 'client/modules/crm' });

Promise.all([
    transpiler1.process(),
    transpiler2.process(),
]).then(([result1, result2]) => {
    let count = result1.transpiled.length + result2.transpiled.length;
    let copiedCount = result1.copied.length + result2.copied.length;
    console.log(`transpiled: ${count}, copied: ${copiedCount}`);
}).catch(error => console.error(error));
