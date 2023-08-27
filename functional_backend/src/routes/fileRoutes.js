
import { container } from '../builder';

const routes = (app) => {

    app.route('/file')
        .post(container.resolve('addNewFile'))

    app.route('/file/:fileId')
        .get(container.resolve('getFile'))

}

export { routes }

// export default routes;
