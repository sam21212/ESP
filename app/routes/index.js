import initCampaignRoutes from './espRoutes';

const initRoutes = (app) => {
  app.use(`/lists`, initCampaignRoutes());
};

export default initRoutes;
