
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    host: "smtp.gmail.com",
    auth: {
        // A remplir
        user: 'metzopro97@gmail.com',
        pass: 'Metzo16Metal.9702'
    },
    tls: {
        rejectUnauthorized: false
    }
});

const handlebarOptions = {
    viewEngine: {
        extName: '.html',
        partialsDir: '../../patials',
        layoutsDir: '../../layouts',
        defaultLayout: '',
    },
    viewPath: 'views/templates',
    extName: '.html',
};
transporter.use('compile', hbs(handlebarOptions));

export const mailToDestinataire = (emetteur, destinataire, token,message) => transporter.sendMail({
    from: emetteur,
    to: destinataire,
    subject: "Un fichier vous a été envoyé",
    template: "sendMail",
    context: {
        token: token,
        message: message
    }
});
