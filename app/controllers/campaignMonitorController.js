import Responder from '../../lib/expressResponder';
import Request from '../../lib/request'; 
import { ParameterInvalidError } from '../errors';
import Validator from '../utils/util';

export default class CampaignMonitorController {

  constructor(req) {

    const request = new Request(`https://api.createsend.com/api/v3.1`, {
      Authorization: req.headers.authorization
    });

    this.request = request;
  }

  getSubscriberCount(req, res) {

    const listid = req.params.listid;
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

    this._getCountForCampaign(listid, this.request, beforeDate)
      .then((firstDate) => {
         before = firstDate.TotalNumberOfRecords; 
         return this._getCountForCampaign(listid, this.request, afterDate);
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

    const listid = req.params.listid;
    const clientid = req.query.clientid;
    let listCampaign = [];

    this._getCampaigns(clientid, this.request)
      .then((campaigns) => {

        let loopCount = campaigns.length;
        campaigns.forEach((campaign) => {
          this._getListForCampaign(campaign.CampaignID, this.request)
            .then((result) => {
              result.Lists.forEach((list) => {
                if(list.ListID == listid) 
                    listCampaign.push(campaign.CampaignID) 
              })
            })
            .then(() => {
              loopCount--;
              if(loopCount == 0) Responder.success(res, listCampaign);              
          })
        })
      })
      .catch((err) =>{
        Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      })
    }

  _getCountForCampaign(listid, request, date) {

    return request.get(`/lists/${listid}/active.json`, `date=${date}`);
  }

  _getCampaigns(clientid, request) {

    return request.get(`/clients/${clientid}/campaigns.json`);  
  };

  _getListForCampaign(campaignid, request) {
   
    return request.get(`/campaigns/${campaignid}/listsandsegments.json`);
  }

  _errorHandler(err) {
    if(err.Code == 101) 
      return {message: "ListID provided must be valid"};

    if(err.Code == 102)
      return {message: "ClientId provided must be valid"};
  }
}
