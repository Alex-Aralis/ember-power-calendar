import { getProperties } from '@ember/object';
import { isBetween, isSame, diff, startOf } from 'ember-power-calendar-utils';


export function build(date, current, calendar) {
  let dateObj = this._super(...arguments);
  let { start, end } = getProperties(calendar.selected || { start: null, end: null }, 'start', 'end');

  if (!start && !end) {
    dateObj.isRangeStart = false;
    dateObj.isRangeEnd = false;

  } else if (start && !end) {
    dateObj.isRangeStart = dateObj.isSelected = isSame(date, start, dateObj.type);
    dateObj.isRangeEnd = false;

    if (!dateObj.isDisabled) {
      let diffInMs = Math.abs(diff(dateObj.date, start));
      dateObj.isDisabled = diffInMs < calendar.minRange
        || calendar.maxRange !== null && diffInMs > calendar.maxRange;
    }

  } else if (start && end) {
    dateObj.isSelected = isBetween(date, start, end, dateObj.type, '[]');
    dateObj.isRangeStart = dateObj.isSelected && isSame(date, start, dateObj.type);
    dateObj.isRangeEnd = dateObj.isSelected && isSame(date, end, dateObj.type);

    if(calendar.proximitySelection && !dateObj.isDisabled) {
      let startDiffInMs = diff(dateObj.date, start);
      let endDiffInMs = diff(startOf(end, dateObj.type), dateObj.date);

      dateObj.isDisabled = calendar.maxRange !== null && 
        (startDiffInMs > calendar.maxRange || endDiffInMs > calendar.maxRange);
    }
  }
  
  return dateObj;
}

export function isSelected() {
  return false;
}