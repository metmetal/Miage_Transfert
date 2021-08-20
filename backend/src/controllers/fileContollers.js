import mongoose from 'mongoose';
import { FileSchema } from '../models/fileModel';
import {mailToDestinataire} from '../../mailer';

const File=mongoose.model('File',FileSchema);
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');
const AdmZip = require('adm-zip');
export const addNewFile=async (req, res) => {
     try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "fichier") to retrieve the uploaded file
            const fichier = req.files.file;

            if (fichier instanceof Array) {
                const zip = new AdmZip()
                fichier.forEach(file => {
                    zip.addFile(file.name, file.data, '', null)
                })
                const newFile = new File(req.body);
                newFile.name = uniqid('', '-archive.zip');
                zip.writeZip('./uploads/' + newFile.name);

                const s = fs.readFileSync(path.join(__dirname,'../../uploads/' + newFile.name))
                const shasum = crypto.createHash('sha256')
                shasum.update(s);
                newFile.hash = shasum.digest('hex');

                newFile.token = crypto.randomBytes(64).toString('hex');

                try {
                    const file = await newFile.save();
                    console.log(file);
                    mailToDestinataire(file.emetteur, file.destinataire, file.token).then(res2 => {
                        res.send({
                            status: true,
                            message: 'File is uploaded',
                            file: file,
                            sent: res2.accepted.length
                        });
                    })

                }catch (err) {
                    console.log(err);
                }

            } else {

                //Use the mv() method to place the file in upload directory (i.e. "uploads")
                const newFile = new File(req.body);
                 newFile.name = uniqid('', '-' + fichier.name)
                await fichier.mv('./uploads/' + newFile.name);

                 const chemin = path.join(__dirname,'../../uploads/' + newFile.name)
                 const s = fs.readFileSync(chemin)
                 const shasum = crypto.createHash('sha256')
                 shasum.update(s)
                 newFile.hash = shasum.digest('hex');

                 newFile.token = crypto.randomBytes(64).toString('hex');

                try {
                    const file = await newFile.save();
                    mailToDestinataire(file.emetteur, file.destinataire, file.token).then(res2 => {
                        res.send({
                            status: true,
                            message: 'File is uploaded',
                            file: file,
                            sent: res2.accepted.length
                        });
                    })
                }catch (err) {
                    console.log(err);
                }

            }

        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }

}

export const getFilewithID=async (req,res)=>{
    try {
        const file = await File.find({token : req.params.fileId})
        fs.readFile('./uploads/' + file[0].name, {encoding:'base64'},(err, data) => {
            if(err){
                console.log(err)
            }
            res.send({
                file: data,
                name: file[0].name,
                size: file[0].size,
                hash: file[0].hash,
                token: file[0].token
            });
        })
    }catch (err) {
        res.send(err);

    }

}

