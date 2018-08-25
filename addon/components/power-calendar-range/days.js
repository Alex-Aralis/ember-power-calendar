import { getProperties } from '@ember/object';
import DaysComponent from '../power-calendar/days';
import { isBetween, isSame, diff, startOf } from 'ember-power-calendar-utils';

export default DaysComponent.extend({
  // Methods
  buildDay(date, today, calendar) {
    let day = this._super(...arguments);

    let { start, end } = getProperties(calendar.selected || { start: null, end: null }, 'start', 'end');

    if (!start && !end) {
      day.isRangeStart = false;
      day.isRangeEnd = false;

    } else if (start && !end) {
      day.isRangeStart = day.isSelected = isSame(date, start, day.type);
      day.isRangeEnd = false;

      if (!day.isDisabled) {
        let diffInMs = Math.abs(diff(day.date, start));
        day.isDisabled = diffInMs < calendar.minRange
          || calendar.maxRange !== null && diffInMs > calendar.maxRange;
      }

    } else if (start && end) {
      day.isSelected = isBetween(date, start, end, day.type, '[]');
      day.isRangeStart = day.isSelected && isSame(date, start, day.type);
      day.isRangeEnd = day.isSelected && isSame(date, end, day.type);

      if(calendar.proximitySelection && !day.isDisabled) {
        let startDiffInMs = diff(day.date, start);
        let endDiffInMs = diff(startOf(end, day.type), day.date);

        day.isDisabled = calendar.maxRange !== null && 
          (startDiffInMs > calendar.maxRange || endDiffInMs > calendar.maxRange);
      }
    }

    return day;
  },

  dayIsSelected() {
    return false;
  }
});
