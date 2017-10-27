import Responder from '../../lib/expressResponder';
import Request from '../../lib/request';
import Validator from '../utils/util';
import { ParameterInvalidError } from '../errors';

export default class MailChimpController {

  constructor(req) {
    const request = new Request(`https://us17.api.mailchimp.com/3.0`, {
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

    this._getCountForChimp(listid, this.request, beforeDate, afterDate)
      .then((result) => {
        Responder.success(res, {result: result.total_items});
      })
      .catch((err) => {
        return Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      })
  }

  listCampaign(req, res) {

    const listid = req.params.listid;

    this._getListForChimp(listid, this.request)
      .then((result) => {
        Responder.success(res, {result: result.total_items}) 
      })
      .catch((err) => {
        Responder.operationFailed(res, new ParameterInvalidError(this._errorHandler(err)));
      });       
  }

  _getListForChimp(listid, request) {

    return request.get('/campaigns', `list_id=${listid}`);
  }

  _getCountForChimp(listid, request, beforeDate, afterDate) {

    return request.get(`/lists/${listid}/members`, `since_timestamp_opt  
      =${afterDate}&before_timestamp_opt=${beforeDate}`);
  }

  _errorHandler(err) {
    if(err.status == 404) {
      return {message: "ListID provided must be valid"};
    }
  }
}
