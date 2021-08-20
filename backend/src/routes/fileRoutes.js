import {runInNewContext} from 'vm';
import {addNewFile,
        getFilewithID,
} from '../controllers/fileContollers';

const routes=(app)=>{
    app.route('/file')
        .post(addNewFile)

    app.route('/file/:fileId')
        .get(getFilewithID)

}

export default routes;
