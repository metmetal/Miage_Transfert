import express from "express";
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routesFile from './src/routes/fileRoutes';
import cors from 'cors';
import {FileSchema} from "./src/models/fileModel";
const fileUpload = require('express-fileupload');
const cron = require("node-cron");
let moment = require('moment');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app=express();
const PORT=5000;

//connection mongoose
mongoose.promise=global.promise;
mongoose.connect('mongodb://localhost/FilesDb',{
    useNewUrlParser:true,
    useUnifiedTopology: true

})

//Remove old files
const File=mongoose.model('File',FileSchema);
cron.schedule("0 0 * * *", function() {

    File.find({},(err,file)=>{
        if(err){
            res.send(err)
        }
        file.forEach(f => {
            if((moment().date()-moment(f.created_date).date()) > 7) {
                fs.unlink(path.join(__dirname,'./uploads/' + f.name), (err) => {
                    if (err) {
                        console.log(err)
                    } else {

                        console.log('fichier supprimé du dossier')
                    }
                })
                console.log("Le fichier est supprimé");

                File.remove({_id:f._id},(err,file)=>{
                    if(err){
                        res.send(err)
                    }
                    console.log("fichier supprimé de la base de données");
                })


            }
        })
    });

});

console.log(File)

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//body-parser
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

routesFile(app);

app.get("/",(req,res)=>
    res.send(`serveur node et express sur port ${PORT}`)
)

app.listen(PORT,()=>
    console.log(`Votre serveur est sur le port ${PORT}`)
)
