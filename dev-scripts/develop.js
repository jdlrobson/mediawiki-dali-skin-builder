import fetch from 'node-fetch';
import demoData from '../test/data/demo.json';
import mustache from 'mustache';
import './dev.less';
import { skins } from '../src/index';

const HOST = 'https://en.wikipedia.org';
const TITLE = demoData.title.replace( / /g, '_' );
const KEY = (new Date()).toISOString().substr(0,10);

const query = {};
const params = document.location.search.split('?')[1].split('=');
params.forEach((val, i) => {
    if ( i % 2 !== 0) {
        query[params[i-1]] = val;
    }
});

function skinchanger() {
    const fixed = document.createElement('div');
    fixed.setAttribute('class', 'dali-toolbar');
    const label = document.createElement('label');
    label.setAttribute('class', 'dali-toolbar__label')
    label.textContent = 'switch skin';
    const select = document.createElement('select');
    Object.keys(skins).forEach((name) => {
        const option = document.createElement('option');
        option.textContent = name;
        option.value = name;
        if (name === query.skin) {
            option.setAttribute('selected', true);
        }
        select.appendChild(option);
    })
    fixed.appendChild(label);
    fixed.appendChild(select);
    select.setAttribute('class', 'dali-toolbar__select');
    select.addEventListener('change', (ev) => {
        window.location.search = `?skin=${ev.target.value}`;
    });
    document.body.appendChild(fixed);
}

function renderskin(name) {
    let dataPromise;
    if ( localStorage.getItem(KEY) ) {
        dataPromise = Promise.resolve(JSON.parse(localStorage.getItem(KEY)));
    } else {
        dataPromise = fetch( `${HOST}/w/api.php?action=parse&format=json&page=${encodeURIComponent(TITLE)}&prop=text%7Clanglinks%7Ccategorieshtml%7Ccategories%7Clinks%7Ctemplates%7Cimages%7Cexternallinks%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&formatversion=2&origin=*` ).then( function ( resp ) {
            return resp.json();
        } ).then( (json) => {
            localStorage.setItem(KEY, JSON.stringify(json));
            return json;
        })
    }
    dataPromise.then( function ( data ) {
        const parse = data.parse;
        document.body.innerHTML = mustache.render( skins[name].default(),
            Object.assign( {}, demoData, {
                'html-pagetitle': parse.displaytitle,
                'html-bodycontent': parse.text,
                'html-categorylinks': parse.categorieshtml
            } )
        );
        skinchanger();
    } );
}

if(skins[query.skin]) {
    renderskin(query.skin);
} else {
    renderskin('dali');
}
