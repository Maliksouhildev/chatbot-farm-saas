const vscode = acquireVsCodeApi();

window.addEventListener('load', main);
window.addEventListener('message', function (ev) { message(ev.data); });

/**
 * Hook element by id to a function.
 * @param {string} id
 * @param {(this: HTMLElement) => any} fn
 */
function onclick(id, fn) {
    const e = document.getElementById(id);
    if (e && fn) e.addEventListener('click', fn);
}

function main() {

    onclick('btn-activate', function () {
        activate();
    });

    // onclick('try-link', function () {
    //     vscode.postMessage({ command: 'try' });
    // });

    onclick('btn-buy', function () {
        vscode.postMessage({ command: 'buy' });
    });

    onclick('btn-changelog', function () {
        vscode.postMessage({ command: 'changelog' });
    })

    onclick('btn-activate-phptools', function () {
        vscode.postMessage({ command: 'activate-phptools' })
    })

    onclick('btn-subscribe', function () {
        subscribe();
    })

    let e = document.getElementById('txt-subscribe');
    if (e) e.addEventListener('keyup', function (event) {
        if (event.key === "Enter") {
            subscribe();
        }
    });

    e = document.getElementById('txt-license');
    if (e) e.addEventListener('keyup', function (event) {
        if (event.key === "Enter") {
            activate();
        }
    });

    e = document.getElementById('shownews');
    if (e) e.addEventListener('change', function () {
        vscode.postMessage({ command: 'shownews', value: this.checked ? true : false });
    });

    // post "loaded" message
    vscode.postMessage({ command: 'loaded', });
}

/** @param {{command: string, data: any}} e */
function message(e) {

    if (!e || !e.command) return;

    switch (e.command) {
        case 'l':
            // const status = document.getElementById('subtitle');
            // status.innerText = e.data.statusText;
            // status.classList.remove('hidden');

            // const features = document.getElementById('features');
            // features.innerHTML = e.data.featuresHtml;

            const txt_activated = document.getElementById('txt-activated');
            const txt_not_activated = document.getElementById('txt-not-activated');

            if (e.data.valid) {
                txt_not_activated.classList.add('hidden');
                txt_activated.classList.remove('hidden');
            }
            else {
                txt_not_activated.classList.remove('hidden');
                txt_activated.classList.add('hidden');
            }
            break;
    }
}

function activate() {
    vscode.postMessage({ command: 'activate', value: document.getElementById('txt-license').value });
}

function subscribe() {
    vscode.postMessage({ command: 'subscribe', email: document.getElementById('txt-subscribe').value });
}
