/**
 * @description delete extensions / apps by del command
 * @author  tomasy
 * @mail solopea@gmail.com
 */

import util from '../../common/util'

const version = 2;
const name = 'deleteExtension';
const key = 'del';
const type = 'keyword';
const icon = chrome.extension.getURL('img/del.png');
const title = chrome.i18n.getMessage(`${name}_title`);
const subtitle = chrome.i18n.getMessage(`${name}_subtitle`);
const commands = [{
    key,
    type,
    title,
    subtitle,
    icon,
    editable: true
}];

function uninstall(id, cb) {
    chrome.management.uninstall(id, function (...args) {
        Reflect.apply(cb, null, args);
    });
}

// get all
function getExtensions(query, enabled, callback) {
    chrome.management.getAll(function (extList) {
        const matchExts = extList.filter(function (ext) {
            return util.matchText(query, ext.name);
        });

        callback(matchExts);
    });
}

function dataFormat(rawList) {
    return rawList.map(function (item) {
        const url = item.icons instanceof Array ? item.icons[item.icons.length - 1].url : '';
        const isWarn = item.installType === 'development';
        return {
            key,
            id: item.id,
            icon: url,
            title: item.name,
            desc: item.description,
            isWarn: isWarn

        };
    });
}
function onInput(query) {
    return new Promise(resolve => {
        getExtensions(query.toLowerCase(), false, function (matchExts) {
            sortExtensions(matchExts, query, function (data) {
                resolve(dataFormat(data));
            });
        });
    });
}

function onEnter(item) {
    uninstall(item.id, function () {
        // cb
    });
    this.refresh();
}

function sortExtFn(a, b) {
    return a.num === b.num ? b.update - a.upate : b.num - a.num;
}

function sortExtensions(exts, query, callback) {
    let matchExts = exts;

    chrome.storage.sync.get('ext', function (data) {
        const sExts = data.ext;

        if (!sExts) {
            callback(matchExts);
            return;
        }

        // sExts: {id: {id: '', querys: {'key': {num: 0, update: ''}}}}
        matchExts = matchExts.map(function (extObj) {
            const id = extObj.id;

            if (!sExts[id] || !sExts[id].querys[query]) {
                extObj.num = 0;
                extObj.upate = 0;

                return extObj;
            }

            extObj.num = sExts[id].querys[query].num;
            extObj.update = sExts[id].querys[query].update;

            return extObj;
        });

        matchExts.sort(sortExtFn);

        callback(matchExts);
    });
}

export default {
    version,
    name: 'Delete Extension',
    icon,
    title,
    commands,
    onInput,
    onEnter
};
