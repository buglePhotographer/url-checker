Dependencies required: node 10.16.3 or higher

Configure keys inside config.js (gmail account only):

```javascript
config.emailSettings = {
    "sender": "tu-email",
    "password": "tu-password"
};
```

Allow access to insecure apps with that account:

https://myaccount.google.com/lesssecureapps

Then:

```shell
$ npm install
$ npm start {sitemap-url} {toEmail}
```