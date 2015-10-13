module.exports = {
    service: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secureConnection: false,
    auth: {
        use: 'm35karimi@gmail.com',
        pass: 'nu'
    },
    ignoreTLS: false,
    debug: false,
    maxConections: 5
};