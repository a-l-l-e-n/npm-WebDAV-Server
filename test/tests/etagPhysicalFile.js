var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    request = require('request'),
    xmljs = require('xml-js'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('etag of physical file', isValid =>
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(1, server);

    const filePath = path.join(__dirname, 'etagPhysicalFile', 'testFile.txt')
    if(fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, 'Old content');

    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        server.start(options.port + index);

        var wfs = Client(
            "http://127.0.0.1:" + (options.port + index)
        );

        function propfind(callback)
        {
            request({
                url: "http://127.0.0.1:" + (options.port + index) + '/testFile.txt',
                method: 'PROPFIND'
            }, (e, res, body) => {
                if(e)
                {
                    isValid(false, e);
                    return;
                }
                if(res.statusCode > 300)
                {
                    isValid(false, 'Status code received : ' + res.statusCode);
                    return;
                }

                try
                {
                    callback(xmljs.xml2js(body, { compact: true, alwaysArray: true }));
                }
                catch(e)
                {
                    isValid(e);
                }
            })
        }

        propfind((doc) => {
            const etag1 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];

            propfind((doc) => {
                const etag2 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];

                if(etag1 !== etag2)
                {
                    isValid(false, 'ETag changed without file change');
                    return;
                }
                
                wfs.writeFile('/testFile.txt', 'New content', (e) => {
                    if(e)
                    {
                        isValid(false, e);
                        return;
                    }

                    propfind((doc) => {
                        const etag3 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];
                        if(etag1 === etag3)
                            isValid(false, 'ETag didn\'t change with file change');
                        else
                            isValid(true);
                    })
                })
            })
        })
    });
})