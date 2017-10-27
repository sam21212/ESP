export default class Validator {

  static date(date) {

    const days = [31, 28, 31, 30, 31, 30, 31, 31 ,30, 31, 30, 31];
    const splitDate = date.split('-');

    if(splitDate.length !== 3) {
      return {message: "Date should be separated by -"};
    }

    const newYear = splitDate[0];
    const newMonth = splitDate[1];
    const newDate = splitDate[2];
    const regexDate = /[0-9]/gi;
    let invalidDate = false;

    if(newYear.length !== 4 || newMonth.length !== 2 
      || newDate.length !== 2)
      return {message: "Date should be in format yyyy-mm-dd"};

    if(newYear.match(regexDate) === null || newMonth.match(regexDate) === null 
      || newDate.match(regexDate) === null)
      invalidDate = true;

    if(invalidDate || newYear.match(regexDate).length !== 4 || newMonth.match(regexDate).length !== 2 
      || newDate.match(regexDate).length !== 2)
      return {message: "Date can only contain numbers"};

    const today = new Date(); 
    const yyyy = today.getFullYear();

    if(newMonth == 2 && this._isLeapYear(newYear) && newDate > 29) 
      invalidDate = true;

    if(invalidDate || newYear > yyyy || newMonth > 12 || newMonth === '00' || newDate === '00' 
      || newDate > days[Number(newMonth)]) {
      return {message: "Date should be valid and in format yyyy-mm-dd"};
    }
  }

  _isLeapYear(year) {

    if (year % 4 === 0 && year % 100 !==0) {
      return true;
    }

    if (year % 4 === 0 && year % 100 === 0 && year % 400 === 0) {
      return true;
    }

    return false;
  }
}
