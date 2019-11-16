const util = require( 'util' );
const fs = require( 'fs' );
const installpath = process.env.MW_INSTALL_PATH;
const webshot = require( 'webshot' );
console.log('Let\'s build a skin!');

function getUserInput( msg ) {
    return new Promise( ( resolve ) => {
            console.log( msg );
            process.stdin.setEncoding('utf8');
            process.stdin.once('data', function (text) {
                    resolve(
                        util.inspect(text).replace('\\n', '').replace(/['"]/g, '').trim().replace(/ /, '-').toLowerCase()
                     );
            });
    })
}

getUserInput( 'What is the name of skin folder you are working in?' ).then( function ( name ) {
    const i18n = {};
    const qqq = {};
    const uppercaseName = name.charAt(0).toUpperCase() + name.substr(1);
    const rootdir = `${__dirname}/../`;
    const skin = JSON.parse( fs.readFileSync(`${rootdir}/includes/skin.json` ).toString() );
    const outdir = `${rootdir}/output/${uppercaseName}`;
    const screenshotdir = `${outdir}/screenshots`;
    const outincludesdir = `${outdir}/includes`;
    const outsrcdir = `${outdir}/src`;
    const outi18ndir = `${outdir}/i18n`;

    if (name && fs.existsSync(`${rootdir}/src/${name}`) ) {
        console.log(`${uppercaseName} is a great name!`);
    } else {
        console.log(`Please make sure there there is a folder "${name} in the src/ folder!`);
        return;
    }
    i18n[`skinname-${name}`] = uppercaseName;
    i18n[`${name}-desc`] = 'A skin created by Dali without PHP.';
    qqq[`skinname-${name}`] = '{{optional}}';
    qqq[`${name}-desc`] = `{{desc|what=skin|name=${uppercaseName}|url=https://www.mediawiki.org/wiki/Skin:${uppercaseName}}}`;

    // make the required directories
    [ outdir, screenshotdir, outincludesdir, outsrcdir, outi18ndir ].forEach((d) => {
        if (!fs.existsSync(d)){
            fs.mkdirSync(d);
        }
    })

    console.log('Copy include files');
    const templateName = `${uppercaseName}Template`;
    const skinName = `Skin${uppercaseName}`
    fs.writeFileSync(`${outincludesdir}/${templateName}.php`,
        fs.readFileSync(`${rootdir}/includes/ExampleTemplate.php`).toString()
            .replace( 'ExampleTemplate', templateName )
    );
    fs.writeFileSync(
        `${outincludesdir}/${skinName}.php`,
        fs.readFileSync(`${rootdir}/includes/SkinExample.php` ).toString()
            .replace('ExampleTemplate', templateName)
            .replace('SkinExample', skinName)
            .replace(/\<name\>/g, name)
            .replace(/\<uname\>/g, uppercaseName)
    );
    skin.AutoloadClasses[templateName] = `includes/${templateName}.php`;
    skin.AutoloadClasses[skinName] = `includes/${skinName}.php`;

    console.log('Copy src files');
    const packageFiles = [];
    fs.readdirSync(`${rootdir}/src/${name}`).forEach((filename) => {
        if ( filename.indexOf( '.js' ) > -1 && filename !== 'index.js' ) {
            packageFiles.push(`src/${filename}`);
        }
        // #todo: copy recursively.
        fs.copyFileSync(`${rootdir}/src/${name}/${filename}`, `${outsrcdir}/${filename}`);
    });
    skin.ResourceModules[`skins.${name}`] = {
        class: "ResourceLoaderSkinModule",
        features: [ "elements", "content", "interface", "logo" ],
        styles: [
            "src/skin.less"
        ]
    };
    skin.ResourceModules[`skins.${name}.js`] = {
        packageFiles: [
            'src/skin.js'
        ].concat( packageFiles )
    };

    console.log('Defining skin.json');
    skin.namemsg = `skinname-${name}`;
    skin.descriptionmsg = `${name}-desc`;
    skin.url = `https://www.mediawiki.org/wiki/Skin:${uppercaseName}`;
    skin.name = uppercaseName;
    skin.ValidSkinNames[name] = uppercaseName;
    skin.MessagesDirs[uppercaseName] = [ 'i18n' ];
    skin.ResourceFileModulePaths.remoteSkinPath = uppercaseName;
    fs.writeFileSync(`${outdir}/skin.json`, JSON.stringify(skin, null, 2));
    fs.writeFileSync(`${outi18ndir}/en.json`, JSON.stringify(i18n, null, 2));
    fs.writeFileSync(`${outi18ndir}/qqq.json`, JSON.stringify(qqq, null, 2));

    const screenshot = `${screenshotdir}/1280x800.png`;
    console.log('Building screenshot');
    webshot(`http://localhost:8142?skin=${name}`, screenshot,
        function(err) {
            return new Promise( ( resolve ) => {
                const timeout = setInterval( function () {
                    if ( fs.existsSync(screenshot) ) {
                        console.log(`Created screenshot.`);
                        clearInterval(timeout);
                        resolve();
                        console.log( 'All done!' );
                        console.log(`To use your skin put the following in LocalSettings:
wfLoadSkin("${uppercaseName}");

Move the new folder to your MediaWiki skins folder:
mv "output/${uppercaseName}" "${installpath}/skins"
                        `)
                        process.exit();
                    }
                }, 2000 );
            } );
        }
    );
} );

