const getSitemapUrls = (url) => {
    return new Promise((resolve, reject) => {
        const http      = require('http'),
              https     = require('https');

        let client = http;

        if (url.toString().indexOf("https") === 0) {
            client = https;
        }

        client.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });

        }).on("error", (err) => {
            reject(err);
        });
    });
};


const checkUrl = (url, okUrls, errorUrls) => {
    return new Promise((resolve, reject) => {
        
        const http      = require('http'),
              https     = require('https');

        let client = http;

        if (url.toString().indexOf("https") === 0) {
            client = https;
        }

        client.request(url, { method: 'GET' }, (res) => {
            // console.log(url, res.statusCode);
            if(res.statusCode >= 400 && res.statusCode < 500){
                errorUrls.push(url.toString() + ', code: ' + res.statusCode + '\n');
            }

            if(res.statusCode >= 200 && res.statusCode < 400){
                okUrls.push(url);
            }
            resolve();
        }).on('error', (err) => {
            console.error('entro aca');
            errorUrls.push(url);
            resolve();
        }).end();

    })
    
};

const sendEmail = (toEmail, subject, body) => {
    // THIS WON'T WORK IF YOU DON'T ENABLE UNSECURE APPS IN YOUR GMAIL ACCOUNT
    const nodemailer = require('nodemailer');
    const config = require('./config')

    if(config.emailSettings.sender && config.emailSettings.password){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailSettings.sender,
                pass: config.emailSettings.password
            }
        });

        const mailOptions = {
            from: config.emailSettings.sender, // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            text: body // plain text body
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if(err) {
                console.log(err)
            }
            else {
                console.log(info);
            }
        });
    }
    else{
        console.log('Be sure to fill up the config.js file with the credentials of the sender email');
    }

    
};

// 'https://www.cartoonnetwork.com.ar/sitemap/content'
(async () => {
    const sitemapUrl = process.argv[2].toString();
    const toEmail = process.argv[3].toString();
    
    if(sitemapUrl){
        console.log('Checking urls for sitemap of: ', sitemapUrl);

        const sitemapUrls = require('sitemap-urls');
        const urls = sitemapUrls.extractUrls(await getSitemapUrls(sitemapUrl));
        let okUrls = [],
            errorUrls = [];

        const promises = urls.map(url => checkUrl(url, okUrls, errorUrls));

        Promise.all(promises).then((data) => {
            if (toEmail){
                sendEmail(toEmail, 'Urls check for ' + sitemapUrl, errorUrls.toString().replace(/\,/g, ''));
            }
            console.log(errorUrls);

        });
    }
    else{
        console.log('Sitemap url missing, be sure to call this like "npm start sitemapUrl toEmail"');
    }
    


})();

