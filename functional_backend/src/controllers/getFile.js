
import { container } from "../builder";

import { encaseP, chain, fork, Future } from 'fluture';

export const getFile = () => (req, res) => {
    const fileService = container.resolve('fileService')();

    // Convert the Promise-based functions to Future-based ones
    const findFile = encaseP(fileService.findFile);
    const readBase64File = encaseP(fileService.readBase64File);

    // Compose the Futures
    findFile(req.params.fileId)
        .pipe(chain(file =>
            readBase64File(file[0].name)
                .pipe(chain(data => {
                    const responseObject = fileService.createResponseObject(file[0], data);
                    return Future.resolve(responseObject); // Convert the synchronous value to a resolved Future
                }))
        ))
        .pipe(fork
            (err => res.send(err)) // Failure scenario
            (responseObject => res.send(responseObject)) // Success scenario
        );
}

// export const getFile = () => async (req, res) => {

//     const fileService = container.resolve('fileService')();

//     try {
//         const file = await fileService.findFile(req.params.fileId);
//         const data = await fileService.readBase64File(file[0].name);
//         const responseObject = fileService.createResponseObject(file[0], data);
//         res.send(responseObject);
//     } catch (err) {
//         res.send(err);
//     }
// }