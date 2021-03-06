const moment = require('moment');

const MONTH_LIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_LIST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_SHORT_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDay(dateText) {
  const _day = dateText.replace(/(this|next)/i, '').trim();

  return _day;
}

function getDayNum(dateText) {
  const _day = getDay(dateText);

  for (let index = 0; index < DAY_LIST.length; index++) {
    if (DAY_LIST[index].toUpperCase().indexOf(_day.toUpperCase()) !== -1) {
      return index;
    }
  }

  return -1;
}

function getScheduleItem(date) {
  const _year = date.year();
  const _month = date.month();
  const _date = date.date();
  const _hour = date.hour();
  const _day = date.day();
  const _isBefore = date.isBefore();
  const schedule = {
    year: _year,
    month: _month + 1,
    monthName: MONTH_LIST[_month],
    shortMonthName: MONTH_SHORT_LIST[_month],
    date: _date,
    hour: _hour,
    day: _day,
    dayName: DAY_LIST[_day],
    shortDayName: DAY_SHORT_LIST[_day],
    completed: _isBefore,
  };

  return schedule;
}

function splitTextToDateAndText(text) {
  let result;

  const resultToday = text.match(/^today\s/i);
  const resultTomorrow = text.match(/^tomorrow\s/i);
  const resultThis = text.match(/^this ([A-Z]{3}|[A-Z]{3,6}day)\s/i);
  const resultNext = text.match(/^next ([A-Z]{3}|[A-Z]{3,6}day)\s/i);
  const resultDate = text.match(/^([0-9]{1,2}\/[0-9]{1,2}|[0-9]{2,4}\/[0-9]{1,2}\/[0-9]{2,4}|[0-9]{4})\s/);
  const resultDay = text.match(/^([A-Z]{3}|[A-Z]{3,6}day)\s/i);

  if (resultToday) {
    result = resultToday;
  } else if (resultTomorrow) {
    result = resultTomorrow;
  } else if (resultThis) {
    result = resultThis;
  } else if (resultNext) {
    result = resultNext;
  } else if (resultDate) {
    result = resultDate;
  } else if (resultDay) {
    result = resultDay;
  } else {
    result = [''];
  }

  const datePart = result[0];
  const textPart = text.replace(datePart, '').trim();
  const item = {
    date: datePart,
    text: textPart,
  };
  return item;
}

function textToSchedule(dateText, referenceDate) {
  let schedule;
  let _dayNum;
  let _date;
  let date;

  if (dateText) {
    if (dateText.match(/today/i)) {
      // Today
      date = moment(referenceDate);
    } else if (dateText.match(/tomorrow/i)) {
      // Tomorrow
      date = moment(referenceDate).add(1, 'days');
    } else if (dateText.match(/this/i)) {
      // This week
      _dayNum = getDayNum(dateText);
      if (_dayNum !== -1) {
        date = moment(referenceDate).day(_dayNum);
      }
    } else if (dateText.match(/next/i)) {
      // Next week
      _dayNum = getDayNum(dateText);
      if (_dayNum !== -1) {
        date = moment(referenceDate)
          .day(_dayNum)
          .add(7, 'days');
      }
    } else if (dateText.match(/\//)) {
      // Date
      _date = dateText.split('/');
      if (_date.length === 2) {
        _date.unshift(moment(referenceDate).year());
      }
      _date[1] = Number(_date[1]) - 1;
      date = moment(_date);
      if (date.isBefore(referenceDate.subtract(1, 'days'))) {
        date = moment(_date).add(1, 'years');
      }
    } else if (dateText.match(/([0-9]{4})/)) {
      _date = [dateText.substr(0, 2), dateText.substr(2, 2)];
      if (_date.length === 2) {
        _date.unshift(moment(referenceDate).year());
      }
      _date[1] = Number(_date[1]) - 1;
      date = moment(_date);
      if (date.isBefore(referenceDate.subtract(1, 'days'))) {
        date = moment(_date).add(1, 'years');
      }
    } else {
      // Day
      _dayNum = getDayNum(dateText);
      if (_dayNum !== -1) {
        date = moment(referenceDate).day(_dayNum);
      }
      if (date && date.isBefore(referenceDate)) {
        date = date.add(7, 'days');
      }
    }
    if (date) {
      schedule = getScheduleItem(date);
    }
  } else {
    return schedule;
  }

  return schedule;
}

function parseTextWithSchedule(text, referenceDate) {
  const _referenceDate = moment(referenceDate);
  const splitedItem = splitTextToDateAndText(text);
  const schedule = textToSchedule(splitedItem.date, _referenceDate) || null;
  const item = schedule ? { schedule, text: splitedItem.text } : { schedule, text };

  return item;
}

module.exports = {
  parseTextWithSchedule,
};
