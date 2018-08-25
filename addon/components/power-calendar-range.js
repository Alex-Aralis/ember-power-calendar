import { computed, getProperties } from '@ember/object';
import { assign } from '@ember/polyfills';
import CalendarComponent from './power-calendar';
import fallbackIfUndefined from '../utils/computed-fallback-if-undefined';
import {
  diff,
  endOf,
  isAfter,
  isBefore,
  normalizeDate,
  normalizeDuration,
  normalizeRangeActionValue,
  startOf,
} from 'ember-power-calendar-utils';

export default CalendarComponent.extend({
  daysComponent: 'power-calendar-range/days',
  monthsComponent: 'power-calendar-range/months',
  proximitySelection: fallbackIfUndefined(false),

  // CPs
  minRange: computed({
    get() {
      return 86400000;
    },
    set(_, v) {
      if (typeof v === 'number') {
        return v * 86400000;
      }
      return normalizeDuration(v === undefined ? 86400000 : v);
    }
  }),
  maxRange: computed({
    get() {
      return null;
    },
    set(_, v) {
      if (typeof v === 'number') {
        return v * 86400000;
      }
      return normalizeDuration(v === undefined ? 86400000 : v);
    }
  }),
  selected: computed({
    get() {
      return { start: undefined, end: undefined };
    },
    set(_, v) {
      if (v === undefined || v === null) {
        v = {};
      }
      return { start: normalizeDate(v.start), end: normalizeDate(v.end) };
    }
  }),

  currentCenter: computed('center', function() {
    let center = this.get('center');
    if (!center) {
      center = this.get('selected.start') || this.get('powerCalendarService').getDate();
    }
    return normalizeDate(center);
  }),

  publicAPI: computed('_publicAPI', 'minRange', 'maxRange', 'proximitySelection', function() {
    let rangeOnlyAPI = this.getProperties('minRange', 'maxRange', 'proximitySelection');
    return assign(rangeOnlyAPI, this.get('_publicAPI'));
  }),

  // Actions
  actions: {
    select(day, calendar, e) {
      if (day.isDisabled) return;

      const action = this.get('onSelect');
      if (action) {
        action(this._buildRange(day), calendar, e);
      }
    }
  },

  // Methods
  _buildRange(day) {
    let selected = this.get('publicAPI.selected') || { start: null, end: null };
    let { start, end } = getProperties(selected, 'start', 'end');

    if (this.get('proximitySelection')) {
      return this._buildRangeByProximity(day, start, end);
    }

    return this._buildDefaultRange(day, start, end);
  },

  _buildRangeByProximity(day, start, end) {
    const { date, type } = day;

    if (start && end) {
      let changeStart = Math.abs(diff(date, end)) > Math.abs(diff(date, start));
    
      return changeStart
        ? normalizeRangeActionValue(this._buildInclusiveRange(date, end, type))
        : normalizeRangeActionValue(this._buildInclusiveRange(start, date, type))
      ;
    }

    if (isBefore(date, start)) {
      return normalizeRangeActionValue(this._buildInclusiveRange(date, null, type));
    }

    return this._buildDefaultRange(day, start, end);
  },

  _buildDefaultRange({ date, type }, start, end) {
    if (start && !end) {
      if (isAfter(start, date)) {
        return normalizeRangeActionValue(this._buildInclusiveRange(date, start, type));
      }
      return normalizeRangeActionValue(this._buildInclusiveRange(start, date, type));
    }

    return normalizeRangeActionValue(this._buildInclusiveRange(date, null, type));
  },

  _buildInclusiveRange(start, end, type) {
    return { date: { 
      start: start ? startOf(start, type) : null, 
      end: end ? endOf(end, type) : null,
      type
    } };
  }
});
