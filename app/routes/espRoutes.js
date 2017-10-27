import express from 'express';
import CampaignMonitorController from '../controllers/campaignMonitorController';
import MailChimpController from '../controllers/mailChimpController';

const initCampaignRoutes = () => {

  const clientRoutes = express.Router();

  clientRoutes.use((req, res, next) => {

  	const provider = req.headers.provider;
 		let service;

  	if(provider === 'campaignMonitor') {
  	  service = new CampaignMonitorController(req); 
		}

	  if(provider === 'mailChimp') {
			service = new MailChimpController(req);
		}

		if(service === undefined)
			return res.send({message: "Invalid service provider"});

		clientRoutes.get('/:listid/subscribers', (req, res) => service.getSubscriberCount(req, res));
		clientRoutes.get('/:listid/campaigns', (req, res) => service.listCampaign(req, res));

  	next();
  })

  return clientRoutes;
};

export default initCampaignRoutes;
