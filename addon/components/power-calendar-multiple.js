import CalendarComponent from './power-calendar';
import { computed } from '@ember/object';
import {
  normalizeDate,
  isSame,
  normalizeMultipleActionValue
} from 'ember-power-calendar-utils';
import { assert } from '@ember/debug';

export default CalendarComponent.extend({
  daysComponent: 'power-calendar-multiple/days',
  _calendarType: 'multiple',

  // CPs
  selected: computed({
    get() {
      return undefined;
    },
    set(_, v) {
      return Array.isArray(v) ? v.map(normalizeDate) : v;
    }
  }),
  currentCenter: computed('center', function() {
    let center = this.get('center');
    if (!center) {
      center = (this.get('selected') || [])[0] || this.get('powerCalendarService').getDate();
    }
    return normalizeDate(center);
  }),

  // Actions
  actions: {
    select(dayOrDays, calendar, e) {
      let action = this.get("onSelect");
      let days;
      console.log(dayOrDays)

      if (Array.isArray(dayOrDays)) {
        days = dayOrDays;
      } else if (dayOrDays instanceof Object && dayOrDays.date instanceof Date) {
        days = [dayOrDays];
      } else {
        assert(`The select action expects an array of date objects, or a date object. ${typeof dayOrDays} was recieved instead.`);
      }

      if (action) {
        action(this._buildCollection(days), calendar, e);
      }
    }
  },

  // Methods
  _buildCollection(days) {
    let selected = this.get("publicAPI.selected") || [];

    for (const day of days) {
      let index = selected.findIndex(selectedDate => isSame(day.date, selectedDate, "day"));
      if (index === -1) {
        selected = [...selected, day.date];
      } else {
        selected = selected.slice(0, index).concat(selected.slice(index + 1));
      }
    }

    return normalizeMultipleActionValue({ date: selected });
  }
});
