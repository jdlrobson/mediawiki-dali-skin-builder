// There should be no need to change this file.
// If you want to edit JavaScript change the skin.js file.
//
import fs from 'fs';

export default function () {
    import('./skin.less').then(() => {
        return import('./skin.js');
    });

    return fs.readFileSync( `${__dirname}/skin.mustache`, 'utf8' ).toString();
};
