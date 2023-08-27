
function makeServer({ app, bodyParser, cors, fileUpload, routes, jobService, DBConnection }) {

    function start() {

        const PORT = 5000;

        //connection mongoose
        DBConnection.connect();

        //Remove old files
        jobService.launchJob();

        // enable files upload
        app.use(fileUpload({
            createParentPath: true
        }));

        //body-parser
        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json());

        routes(app);

        app.get("/", (req, res) =>
            res.send(`serveur node et express sur port ${PORT}`)
        )

        app.listen(PORT, () =>
            console.log(`Votre serveur est sur le port ${PORT}`)
        )
    }

    return { start }

}

export { makeServer }