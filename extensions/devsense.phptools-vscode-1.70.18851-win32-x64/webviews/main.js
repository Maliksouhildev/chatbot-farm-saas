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
        vscode.postMessage({ command: 'activate' });
    });

    onclick('btn-try', function () {
        vscode.postMessage({ command: 'try' });
    });
    
    onclick('btn-buy', function () {
        vscode.postMessage({ command: 'buy' });
    });

    onclick('btn-changelog', function () {
        vscode.postMessage({ command: 'changelog' });
    })

    onclick('btn-subscribe', function () {
        subscribe();
    })

    Array.prototype.forEach.call(document.getElementsByName('btn-install-extension'), function (el) {
        el.addEventListener('click', function () {
            install_extension(this.getAttribute('data-extension-id'));
        })
    })
    
    Array.prototype.forEach.call(document.getElementsByName('btn-downgrade-extension'), function (el) {
        el.addEventListener('click', function () {
            install_extension(this.getAttribute('data-extension-id'));
        })
    })

    Array.prototype.forEach.call(document.getElementsByName('btn-switch-setting'), function (el) {
        el.addEventListener('change', function () {
            vscode.postMessage({
                command: 'set-config',
                setting: this.getAttribute('data-setting-id'),
                value: JSON.parse(this.getAttribute(this.checked ? 'data-setting-on' : 'data-setting-off'))
            })
        })
    })

    const panels = document.getElementsByTagName('vscode-panels')
    if (panels && panels.length == 1) {
        new MutationObserver(function (list) {
            for (const mutation of list) {
                if (mutation.type === "attributes" && mutation.attributeName === "activeid") {
                    vscode.postMessage(
                        {
                            command: 'activeid',
                            data: mutation.target.getAttribute("activeid")
                        }
                    )
                }
            }
        }).observe(panels[0], { attributes: true })
    }


    Array.prototype.forEach.call(document.getElementsByClassName('btn-buy'), function (el) {
        el.addEventListener('click', function () {
            vscode.postMessage({ command: 'buy' });
        });
    });

    document.getElementById('txt-subscribe').addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            subscribe();
        }
    });

    document.getElementById('shownews').addEventListener('change', function () {
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
            const status = document.getElementById('subtitle');
            status.innerText = e.data.statusText;
            status.classList.remove('hidden');

            // const features = document.getElementById('features');
            // features.innerHTML = e.data.featuresHtml;

            const btnTry = document.getElementById('btn-try');
            const btnBuy = document.getElementById('btn-buy');
            const linkBuy = document.getElementById('buy-link');
            const linkActivate = document.getElementById('activate-link');

            btnTry.classList.toggle('hidden', e.data.valid || !e.data.suggestTrial)
            btnBuy.classList.toggle('hidden', e.data.valid)
            linkBuy.classList.toggle('hidden', e.data.valid)
            linkActivate.classList.toggle('hidden', e.data.valid)

            // const activate = document.getElementById('subtitle-activate');
            // const buybtn = document.getElementById('btn-activate');

            // if (e.data.valid) {
            //     activate.classList.add('hidden');
            //     buybtn.classList.add('hidden')
            // }
            // else {
            //     activate.classList.remove('hidden');
            //     buybtn.classList.remove('hidden');
            // }
            break;
        case 'extensions':
            // e.data: string[]
            if (Array.isArray(e.data)) {
                Array.prototype.forEach.call(document.getElementsByName('btn-install-extension'), function (btn) {
                    let id = btn.getAttribute('data-extension-id')
                    if (id) {
                        if (e.data.includes(id.toLowerCase())) {
                            btn.textContent = 'Enabled' //btn.classList.add('hidden')
                            btn.setAttribute('disabled', '')
                        }
                        else {
                            btn.textContent = 'Install'
                            btn.classList.remove('hidden')
                            btn.removeAttribute('disabled')
                        }
                    }
                })
            }
            break;
        case 'downgrade-version':
            // e:data: { id, version } | undefined
            Array.prototype.forEach.call(document.getElementsByName('btn-downgrade-extension'), function (btn) {
                if (e.data) {
                    btn.classList.remove('hidden')
                    btn.textContent = `Downgrade to ${e.data.version}` //btn.classList.add('hidden')
                    btn.setAttribute('data-extension-id', `${e.data.id}@${e.data.version}`)
                }
                else {
                    btn.classList.add('hidden')
                }
            })
        case 'set-switch':
            // e.data: {setting: string, checked: bool}
            Array.prototype.forEach.call(document.getElementsByName('btn-switch-setting'), function (el) {
                if (el.getAttribute('data-setting-id').toLowerCase() == e.data.setting.toLowerCase()) {
                    el.checked = e.data.checked
                }
            })
            break;
        case 'set-activeid':
            if (typeof e.data == 'string') {
                const panels = document.getElementsByTagName('vscode-panels')
                if (panels && panels.length == 1) {
                    panels[0].setAttribute('activeid', e.data)
                }
            }
    }
}

function subscribe() {
    vscode.postMessage({ command: 'subscribe', email: document.getElementById('txt-subscribe').value });
}

function install_extension(id) {
    // post "install-extension" message
    vscode.postMessage({ command: 'install-extension', id: id });
}