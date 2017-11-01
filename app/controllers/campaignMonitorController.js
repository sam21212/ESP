import Responder from '../../lib/expressResponder';
import Request from '../../lib/request'; 
import { ParameterInvalidError } from '../errors';
import Validator from '../utils/util';

export default class CampaignMonitorController {

  constructor(req) {

    this.request = new Request(`https://api.createsend.com/api/v3.1`, {
      Authorization: req.headers.authorization
    });
  }

  getSubscriberCount(req, res) {

    const listId = req.params.listid;
    const beforeDate = req.query.before;
    const afterDate = req.query.after;
    let before, after, subscribers;

    const beforeDateValidate = Validator.date(beforeDate);

    if(typeof beforeDateValidate !== 'undefined' && beforeDateValidate.hasOwnProperty('message')) {
      return Responder.operationFailed(res, new ParameterInvalidError(beforeDateValidate.message));
    }

    const afterDateValidate = Validator.date(afterDate);

    if(typeof afterDateValidate !== 'undefined' && afterDateValidate.hasOwnProperty('message')) {
      return Responder.operationFailed(res, new ParameterInvalidError(afterDateValidate.message));
    }

    if(beforeDate <= afterDate) {
      return Responder.operationFailed(res, new ParameterInvalidError(
        {"message": "Before Date must be greater than after Date"}));
    }

    this._getCountForCampaign(listId, beforeDate)
     .then((firstDate) => {
        before = firstDate.TotalNumberOfRecords; 
        return this._getCountForCampaign(listId, afterDate);
      })
     .then((secondDate) => {
        after = secondDate.TotalNumberOfRecords;
        subscribers = {totalActive: after - before};
        Responder.success(res, subscribers);
      })
     .catch((err) => {
        Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      });   
  }

  listCampaign(req, res) {

    let listCampaign = [];
    const listId = req.params.listid;
    const clientId = req.query.clientid;

    const gettingLists = (campaign) => {
      this._getListForCampaign(campaign.CampaignID)
       .then((result) => {
          result.Lists.forEach((list) => {
            if(list.ListID == listId) 
              listCampaign.push(campaign.CampaignID) 
          })
      })
    }

    this._getCampaigns(clientId)
     .then((campaigns) => {
        let loopCount = campaigns.length;
        campaigns.forEach((campaign) => {
          gettingLists(campaign)
           .then(() => {
              loopCount--;
              if(loopCount == 0) Responder.success(res, {"List Campaign": listCampaign});              
          })
        })
      })
     .catch((err) =>{
        Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      })
    }

  _getCountForCampaign(listId, date) {

    return this.request.get(`/lists/${listId}/active.json`, `date=${date}`);
  }

  _getCampaigns(clientid) {

    return this.request.get(`/clients/${clientid}/campaigns.json`);  
  };

  _getListForCampaign(campaignid) {
   
    return this.request.get(`/campaigns/${campaignid}/listsandsegments.json`);
  }

  _errorHandler(err) {

    if(err.Code === 101) 
      return {message: "ListID provided must be valid"};

    if(err.Code === 102)
      return {message: "ClientId provided must be valid"};

    if(err.Code === 50) 
      return {message: "API key must be valid"};
  }
}
