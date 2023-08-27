
import { container } from "../builder";
import { Future } from 'fluture'



export const addNewFile = () => (req, res) => {

    const tryGetFileFromRequest = (req) => {
        return Future((reject, resolve) => {
            if (!req.files || !req.files.file) {
                reject('No file uploaded');
            } else {
                resolve(req.files.file);
            }

            return () => { };
        });
    };

    const processFile = (file) => {

        const fileService = container.resolve('fileService')();

        if (file instanceof Array) {
            return fileService.handleMultipleFileUpload(file, req);
        } else {
            return fileService.handleSingleFileUpload(file, req);
        }
    }

    const sendMailForResult = file => {

        const mailService = container.resolve('mailService')();

        return Future.encaseP(mailService.sendMail)({
            emetteur: file.emetteur,
            destinataire: file.destinataire,
            token: file.token,
            message: file.message
        });
    };

    tryGetFileFromRequest(req)
        .pipe(Future.chain(processFile))
        .pipe(Future.chain(sendMailForResult))
        .pipe(Future.fork(error => res.status(500).send(error))
            (result => {
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    //file: file,
                    sent: result.accepted.length
                });
            })
        );

}






// try {
    //     if (!req.files) {
    //         fileService.sendResponse(res, false, 'No file uploaded');
    //         return;
    //     }

    //     const fichier = req.files.file;

    //     const file = (fichier instanceof Array) ?
    //         await fileService.handleMultipleFileUpload(fichier, req) :
    //         await fileService.handleSingleFileUpload(fichier, req);


    //     await mailService.sendMail(file.emetteur, file.destinataire, file.token).then(res2 => {
    //         fileService.sendResponse(res, true, 'File is uploaded', file, res2.accepted.length);
    //     });
    // } catch (err) {
    //     console.log(err);
    //     res.status(500).send(err);
    // }