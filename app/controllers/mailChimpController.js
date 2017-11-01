import Responder from '../../lib/expressResponder';
import Request from '../../lib/request';
import Validator from '../utils/util';
import { ParameterInvalidError } from '../errors';

export default class MailChimpController {

  constructor(req) {
    this.request = new Request(`https://us17.api.mailchimp.com/3.0`, {
      Authorization: req.headers.authorization
    });
  }

  getSubscriberCount(req, res) {

    const listId = req.params.listid;
    const beforeDate = req.query.before;
    const afterDate = req.query.after;

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

    this._getCountForChimp(listId, beforeDate, afterDate)
      .then((result) => {
        Responder.success(res, {totalActive: result.total_items});
      })
      .catch((err) => {
        return Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      })
  }

  listCampaign(req, res) {

    const listId = req.params.listid;

    this._getListForChimp(listId)
     .then((result) => {
        Responder.success(res, {"List Campaign": result.total_items}) 
      })
     .catch((err) => {
        Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      });       
  }

  _getListForChimp(listId) {

    return this.request.get('/campaigns', `list_id=${listId}`);
  }

  _getCountForChimp(listId, beforeDate, afterDate) {

    return this.request.get(`/lists/${listId}/members`, `since_timestamp_opt  
      =${afterDate}&before_timestamp_opt=${beforeDate}`);
  }

  _errorHandler(err) {

    if(err.status === 404) {
      return {message: "ListID provided must be valid"};
    }

    if(err.status === 401)
      return {message: "API key must be valid"};

    if(err.status === 403)
      return {message: "API key provided is linked to different datacenter"};
  }
}
