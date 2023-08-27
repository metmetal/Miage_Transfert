import { createContainer, asFunction, asValue } from 'awilix';
import mongoose from 'mongoose';
import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import uniqid from 'uniqid';
import AdmZip from 'adm-zip';
import Future from 'fluture';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars'
import fileUpload from 'express-fileupload';
import cron from 'node-cron';
import moment from 'moment';
import { routes } from './routes/fileRoutes';
import { FileSchema } from './models/fileModel';
import { makeFileService } from './services/FileService';
import { makeMailService } from './services/mailService';
import { addNewFile } from './controllers/addNewFile';
import { getFile } from './controllers/getFile';
import { makeJobService } from './services/jobService';
import { makeDBConnection } from './DBConnection';
import { makeServer } from './server';


const container = createContainer();

container.register({
    app: asValue(express()),
    fileModel: asValue(mongoose.model('File', FileSchema)),
    crypto: asValue(crypto),
    fs: asValue(fs),
    path: asValue(path),
    uniqid: asValue(uniqid),
    AdmZip: asValue(AdmZip),
    Future: asValue(Future),
    mailer: asValue(nodemailer),
    mongoose: asValue(mongoose),
    bodyParser: asValue(bodyParser),
    cors: asValue(cors),
    cron: asValue(cron),
    moment: asValue(moment),
    fileUpload: asValue(fileUpload),
    mailTemplate: asValue(hbs),
    routes: asValue(routes),
    fileService: asFunction(makeFileService).singleton(),
    mailService: asFunction(makeMailService).singleton(),
    jobService: asFunction(makeJobService).singleton(),
    DBConnection: asFunction(makeDBConnection).singleton(),
    addNewFile: asFunction(addNewFile).singleton(),
    getFile: asFunction(getFile).singleton(),
    server: asFunction(makeServer).singleton(),
});

export { container }
