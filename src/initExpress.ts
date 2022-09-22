import express from 'express';
import path from 'path';

const initExpress = (app: Express.Application, handleNonStaticRequest: (req: any, res: any) => void, workingDir: string): void => {
    // If you provide a relative path to express.static() it is relative to the directory from where you launch the node process.
    // But when running IIS, we launch node from the root /build folder (the folder containing the si3d-coordinator-server.js file),
    // but when running locally we launch from the root /ShopIn3d.Coordinator folder. So to protect against this difference, we
    // use make this an absolute path, and workingDir in this case should be the /build folder.
    // https://expressjs.com/en/starter/static-files.html
    let distFolder: string = path.join(workingDir, '../dist');

    // Define static content type by file extension
    express.static.mime.define({ 'image/texture': ['env', '.env'] });

    // Add response headers to all responses
    app.use(function (req, res, next) {
        res.header('X-Si3d-Coordinator-Version', process.env.SI3D_COORDINATOR_VERSION);
        next();
    });

    // Because the filenames/URLs for the Player assets are not unique to the content,
    // we want to cache them for a short time.
    // TODO (9008523) - Rename these assets to have contenthash filenames
    app.use('*/dist/assets', express.static(path.join(distFolder, 'assets'), { maxAge: '5m' }));
    app.use('*/dist/css', express.static(path.join(distFolder, 'css'), { maxAge: '5m' }));
    app.use('*/dist/environments', express.static(path.join(distFolder, 'environments'), { maxAge: '5m' }));

    // Because these are static assets with filenames/URLs unique to the build,
    // we want to cache them for as long as possible (1 year)
    app.use([
        '/dist',
    ], express.static(distFolder, { maxAge: '1y' }));

    app.get([
        '/',
    ], (req, res) => {
        // Since this is dynamic content which can change when the DB changes,
        // we don't want to cache this at all. But to improve performance we're going with
        // a small max-age to take advantage of CDN/browser caching and allowing clients
        // to be 5-10 minutes stale.
        res.set('Cache-Control', 'public, max-age=180');

        handleNonStaticRequest(req, res);
    });

    // ignore favicon.ico requests
    app.get('/favicon.ico', (_, res) => {
        res.sendStatus(204);
    });

    // health probe endpoint
    app.get('/health-probe', (_, res) => {
        res.sendStatus(200);
    });
};

export default initExpress;