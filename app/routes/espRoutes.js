import express from 'express';
import { CampaignMonitorController, MailChimpController}  from '../controllers';

const initListRoutes = () => {

	const clientRoutes = express.Router();

	clientRoutes.get('/:listid/subscribersCount', serviceSetter(), (req, res) => req.service.getSubscriberCount(req, res));
	clientRoutes.get('/:listid/campaigns', serviceSetter(), (req, res) => req.service.listCampaign(req, res));

	return clientRoutes;
}

const serviceSetter = () => {

  return ((req, res, next) => {

  	const provider = req.headers.provider;

  	if(provider === 'campaignMonitor') {
  	  req.service = new CampaignMonitorController(req); 
		}

	  if(provider === 'mailChimp') {
			req.service = new MailChimpController(req);
		}

		if(req.service === undefined)
			return res.send({message: "Invalid service provider"});

  	next();
  })
};

export default initListRoutes;
