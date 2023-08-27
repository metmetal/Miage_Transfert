
//import { chain, map, fork, encaseP, node } from 'fluture'
import { Future } from 'fluture'

function makeFileService({ fileModel, fs, path, crypto, uniqid, AdmZip, moment }) {
    return function fileService() {

        // Fonctions pures pour l'upload de fichiers
        const computeHash = (data) => {
            const shasum = crypto.createHash('sha256');
            shasum.update(data);
            return shasum.digest('hex');
        };

        const generateToken = () => {
            return crypto.randomBytes(64).toString('hex');
        };

        const createZipFile = (files) => {
            const zip = new AdmZip();
            files.forEach(file => {
                zip.addFile(file.name, file.data, '', null)
            });
            const filename = uniqid('', '-archive.zip');
            zip.writeZip(`./uploads/${filename}`);
            return filename;
        };

        const sendResponse = (res, status, message, file, sent) => {
            res.send({ status, message, file, sent });
        };

        // Fonctions avec des effets secondaires pour l'upload de fichier
        const saveFileToDB = async (file) => {
            try {
                return await file.save();
            } catch (err) {
                console.error(err);
                throw err;
            }
        };

        const moveFile = (file, newPath) => {
            return Future.node(done => file.mv(newPath, done));
        };

        const readFile = (path) => {
            return Future.node(done => fs.readFile(path, done));
        };

        const saveFileToDBWithFuture = (file) => {
            return Future.encaseP(saveFileToDB)(file);
        };

        const handleSingleFileUpload = (fichier, req) => {
            const newFile = new fileModel(req.body);
            newFile.name = uniqid('', `-${fichier.name}`);
            const newPath = `./uploads/${newFile.name}`;
            const chemin = path.join(__dirname, `../../uploads/${newFile.name}`);

            return moveFile(fichier, newPath)
                .pipe(Future.chain(() => readFile(chemin)))
                .pipe(Future.map(data => {
                    newFile.hash = computeHash(data);
                    newFile.token = generateToken();
                    return newFile;
                }))
                .pipe(Future.chain(() => saveFileToDBWithFuture(newFile)));
        };

        const handleMultipleFileUpload = (fichier, req) => {
            const newFile = new fileModel(req.body);
            newFile.name = createZipFile(fichier);
            const chemin = path.join(__dirname, `../../uploads/${newFile.name}`);

            return readFile(chemin)
                .pipe(Future.map(data => {
                    newFile.hash = computeHash(data);
                    newFile.token = generateToken();
                    return newFile;
                }))
                .pipe(Future.chain(saveFileToDBWithFuture));
        };

        // const handleSingleFileUpload = async (fichier, req) => {
        //     const newFile = new fileModel(req.body);
        //     newFile.name = uniqid('', `-${fichier.name}`);
        //     await fichier.mv(`./uploads/${newFile.name}`);
        //     const chemin = path.join(__dirname, `../../uploads/${newFile.name}`);
        //     const s = fs.readFileSync(chemin);
        //     newFile.hash = computeHash(s);
        //     newFile.token = generateToken();
        //     return await saveFileToDB(newFile);
        // };

        // const handleMultipleFileUpload = async (fichier, req) => {
        //     const newFile = new fileModel(req.body);
        //     newFile.name = createZipFile(fichier);
        //     const s = fs.readFileSync(path.join(__dirname, `../../uploads/${newFile.name}`));
        //     newFile.hash = computeHash(s);
        //     newFile.token = generateToken();
        //     return await saveFileToDB(newFile);
        // };


        // const saveFileToDB = (file) => {
        //     return Future((reject, resolve) => {
        //         file.save()
        //             .then(resolve)
        //             .catch(err => {
        //                 console.error(err);
        //                 reject(err);
        //             });
        //     });
        // };


        // Fonctions pures/avec effets secondaires pour le download de fichiers

        const findFile = (fileId) => fileModel.find({ token: fileId });

        const readBase64File = (fileName) => new Promise((resolve, reject) => {
            fs.readFile('./uploads/' + fileName, { encoding: 'base64' }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const createResponseObject = (file, data) => {
            const { name, size, hash, token } = file;
            return { file: data, name, size, hash, token };
        };


        // Fonctions pour la suppression de fichiers anciens déclenché par le job

        const isFileOlderThanAWeek = (file) => {
            return (moment().date() - moment(file.created_date).date()) > 7;
        };

        const deleteFileFromDirectory = (fileName) => {
            return new Promise((resolve, reject) => {
                fs.unlink(path.join(__dirname, './uploads/' + fileName), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('fichier supprimé du dossier');
                    }
                });
            });
        };

        const deleteFileFromDB = (fileID) => {
            return new Promise((resolve, reject) => {
                fileModel.remove({ _id: fileID }, (err, file) => {
                    if (err) {
                        reject(err);
                    }
                    resolve("fichier supprimé de la base de données");
                });
            });
        };

        const removeOldFiles = () => {
            return new Promise((resolve, reject) => {
                fileModel.find({}, (err, files) => {
                    if (err) {
                        reject(err);
                    }

                    const deletionPromises = files
                        .filter(isFileOlderThanAWeek)
                        .map(async file => {
                            await deleteFileFromDirectory(file.name);
                            console.log("Le fichier est supprimé");
                            await deleteFileFromDB(file._id);
                        });

                    Promise.all(deletionPromises)
                        .then(() => resolve('All old files deleted'))
                        .catch(reject);
                });
            });
        };



        return {
            handleSingleFileUpload,
            handleMultipleFileUpload,
            sendResponse,
            findFile,
            readBase64File,
            createResponseObject,
            removeOldFiles

        }
    }
}

export { makeFileService }