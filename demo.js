import './resources/main.less';
import './resources/main.js';
import demoData from './test/data/demo.json';
import mustache from 'mustache';
import fs from 'fs'

const HOST = 'https://en.wikipedia.org';
const TITLE = 'Salvador_Dalí';

const template = fs.readFileSync(__dirname + '/templates/skin.mustache', 'utf8' );
const KEY = (new Date()).toISOString().substr(0,10);

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
    document.body.innerHTML = mustache.render( template,
        Object.assign( {}, demoData, {
            'html-pagetitle': parse.displaytitle,
            'html-bodycontent': parse.text,
            'html-categorylinks': parse.categorieshtml
        } )
    );
} );
