import { getProperties } from '@ember/object';
import { isBetween, isBefore, isSame, diff, startOf, endOf } from 'ember-power-calendar-utils';


export function build(date, current, calendar) {
  let dateObj = this._super(...arguments);
  let { start, end } = getProperties(calendar.selected || { start: null, end: null }, 'start', 'end');

  let nextStart, nextEnd;

  if (!start && !end) {
    nextStart = startOf(dateObj.date, dateObj.type);
    nextEnd = null;
  } else if (start && !end) {
    if (isBefore(start, date)) {
      nextStart = startOf(start, dateObj.type);
      nextEnd = endOf(dateObj.date, dateObj.type);
    } else {
      nextStart = startOf(dateObj.date, dateObj.type);
      nextEnd = endOf(start, dateObj.type);
    }
  } else {
    console.log('start diff', diff(start, dateObj.date))
    console.log('end diff', diff(dateObj.date, end))

    if (diff(start, dateObj.date) > diff(dateObj.date, end)) {
      nextStart = startOf(dateObj.date, dateObj.type);
      nextEnd = endOf(end, dateObj.type);
    } else {
      nextStart = startOf(start, dateObj.type);
      nextEnd = endOf(dateObj.date, dateObj.type);
    }
  }


  if (!start && !end) {
    dateObj.isRangeStart = false;
    dateObj.isRangeEnd = false;

  } else if (start && !end) {
    dateObj.isRangeStart = dateObj.isSelected = isSame(date, start, dateObj.type);
    dateObj.isRangeEnd = false;

    if (!dateObj.isDisabled) {
      let diffInMs;

      if (isBefore(start, dateObj.date)) {
        diffInMs = Math.abs(diff(
          startOf(start, dateObj.type),
          endOf(dateObj.date, dateObj.type)
        ));
      } else {
        diffInMs = Math.abs(diff(
          endOf(start, dateObj.type),
          startOf(dateObj.date, dateObj.type)
        ));
      }

      dateObj.isDisabled = diffInMs < calendar.minRange
        || calendar.maxRange !== null && diffInMs > calendar.maxRange;
    }

  } else if (start && end) {
    dateObj.isSelected = isBetween(date, start, end, dateObj.type, '[]');
    dateObj.isRangeStart = dateObj.isSelected && isSame(date, start, dateObj.type);
    dateObj.isRangeEnd = dateObj.isSelected && isSame(date, end, dateObj.type);

    if(calendar.proximitySelection && !dateObj.isDisabled) {
      let startDiffInMs, endDiffInMs;

      if (isBefore(start, dateObj.date)) {
        startDiffInMs = diff(
          endOf(dateObj.date, dateObj.type),
          startOf(start, dateObj.type)
        );
        endDiffInMs = diff(
          endOf(end, dateObj.type),
          startOf(dateObj.date, dateObj.type)
        );
      } else {
        startDiffInMs = diff(
          startOf(dateObj.date, dateObj.type),
          endOf(start, dateObj.type)
        );
        endDiffInMs = diff(
          startOf(end, dateObj.type),
          endOf(dateObj.date, dateObj.type)
        );
      }

      dateObj.isDisabled = calendar.maxRange !== null && 
        (startDiffInMs > calendar.maxRange || endDiffInMs > calendar.maxRange);
    }
  }
  
  if (!dateObj.isDisabled) {
    console.log('current', dateObj.date)
    console.log('start', nextStart);
    console.log('end', nextEnd);
  }

  return dateObj;
}

export function isSelected() {
  return false;
}