import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const FileSchema = new Schema({
    destinataire: {
        type: String,
    },

    emetteur: {
        type: String,
    },

    message: {
        type: String,
    },

    name: {
        type: String,
    },

    file: {
        type: Object
    },

    type: {
        type: String
    },

    size: {
        type: String
    },

    sent: {
        type: Number
    },

    hash: {
        type: String
    },

    token: {
        type: String
    },


    created_date: {
        type: Date,
        default: Date.now
    }
})
