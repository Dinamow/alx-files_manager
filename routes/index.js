import AppController from '../controllers/AppController';

/**
 * Injects routes with their handlers to the given Express application.
 * @param {Express} api
 */
const injectRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
};

export default injectRoutes;
