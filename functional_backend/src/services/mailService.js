
function makeMailService({ mailer, mailTemplate }) {

    return function mailService() {
        const transporter = mailer.createTransport({
            service: 'gmail',
            secure: false,
            host: "smtp.gmail.com",
            auth: {
                // A remplir
                user: '',
                pass: ''
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
        transporter.use('compile', mailTemplate(handlebarOptions));

        const sendMail = async ({ emetteur, destinataire, token, message }) => await transporter.sendMail({
            from: emetteur,
            to: destinataire,
            subject: "Un fichier vous a été envoyé",
            template: "sendMail",
            context: {
                token: token,
                message: message
            }
        });


        return {
            sendMail
        }
    }
}

export { makeMailService }