const { parentPort, workerData } = require('worker_threads');
const { Transpiler } = require('espo-frontend-build-tools');

const transpiler = new Transpiler({
    file: workerData.file,
    mod: workerData.mod,
    path: workerData.path,
});

new Promise((resolve, reject) => {
    try {
        const result = transpiler.process();
        resolve(result);
    } catch (error) {
        reject(error);
    }
})
.then(result => {
    parentPort.postMessage({
        transpiled: result.transpiled,
        copied: result.copied,
    });
})
.catch(error => {
    parentPort.postMessage({ error: error.message });
});