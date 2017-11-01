import initListRoutes from './espRoutes';

const initRoutes = (app) => {
  app.use(`/lists`, initListRoutes());
};

export default initRoutes;
