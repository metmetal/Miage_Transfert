function makeDBConnection({ mongoose }) {

    function connect() {
        mongoose.promise = global.promise;
        mongoose.connect('mongodb://localhost/FilesDb', {
            useNewUrlParser: true,
            useUnifiedTopology: true

        })
    }

    return { connect }
}

export { makeDBConnection }