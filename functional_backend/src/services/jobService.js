function makeJobService({ fileService, cron }) {

    function launchJob() {

        cron.schedule("0 0 * * *", async function () {
            try {
                await fileService.removeOldFiles();
            } catch (err) {
                console.error("Error during file removal:", err);
            }
        });

    }

    return { launchJob }
}

export { makeJobService }