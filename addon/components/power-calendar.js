import Component from '@ember/component';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';
import layout from '../templates/components/power-calendar';
import { assert } from '@ember/debug';
import {
  add,
  normalizeDate,
  normalizeCalendarValue
} from 'ember-power-calendar-utils';
export default Component.extend({
  layout,
  classNames: ['ember-power-calendar'],
  powerCalendarService: inject('power-calendar'),
  navComponent: 'power-calendar/nav',
  daysComponent: 'power-calendar/days',
  monthsComponent: 'power-calendar/months',
  yearsComponent: 'power-calendar/years',
  center: null,

  // Lifecycle chooks
  init() {
    this._super(...arguments);
    let changeCenter = (newCenter, calendar, e) => {
      return this.get('changeCenterTask').perform(newCenter, calendar, e);
    };
    this.publicActions = {
      changeCenter,
      moveCenter: (step, unit, calendar, e) => {
        const center = this.get('currentCenter');
        let newCenter;

        if (unit === 'decade') {
          newCenter = add(center, 10 * step, 'year');
        } else {
          newCenter = add(center, step, unit);
        }

        return changeCenter(newCenter, calendar, e);
      },
      select: (...args) => this.send('select', ...args),
      selectQuarter: (...args) => this.send('selectQuarter', ...args)
    };
    this.registerCalendar();
    let onInit = this.get('onInit');
    if (onInit) {
      onInit(this.get('publicAPI'));
    }
  },

  willDestroy() {
    this._super(...arguments);
    this.unregisterCalendar();
  },

  // CPs
  selected: computed({
    get() {
      return undefined;
    },
    set(_, v) {
      return normalizeDate(v);
    }
  }),

  currentCenter: computed('center', function() {
    let center = this.get('center');
    if (!center) {
      center = this.get('selected') || this.get('powerCalendarService').getDate()
    }
    return normalizeDate(center);
  }),

  publicAPI: computed('_publicAPI', function() {
    return this.get('_publicAPI');
  }),

  _publicAPI: computed('selected', 'currentCenter', 'locale', 'powerCalendarService.locale', 'changeCenterTask.isRunning', function() {
    return {
      uniqueId: guidFor(this),
      selected: this.get('selected'),
      loading: this.get('changeCenterTask.isRunning'),
      center: this.get('currentCenter'),
      locale: this.get('locale') || this.get('powerCalendarService.locale'),
      actions: this.get('publicActions')
    };
  }),

  // Actions
  actions: {
    select(dateObj, calendar, e) {
      let action = this.get('onSelect');
      if (action) {
        action(dateObj, calendar, e);
      }
    },

    selectQuarter(quarter, calendar, e) {
      let action = this.get('onSelectQuarter');
      if (action) action(quarter, calendar, e);
    }
  },

  // Tasks
  changeCenterTask: task(function* (newCenter, calendar, e) {
    let action = this.get('onCenterChange');
    assert('You attempted to move the center of a calendar that doesn\'t receive an `onCenterChange` action.', typeof action === 'function');
    let value = normalizeCalendarValue({ date: newCenter });
    yield action(value, calendar, e);
  }),

  // Methods
  registerCalendar() {
    if (window) {
      window.__powerCalendars = window.__powerCalendars || {}; // TODO: weakmap??
      window.__powerCalendars[guidFor(this)] = this;
    }
  },

  unregisterCalendar() {
    if (window) {
      delete window.__powerCalendars[guidFor(this)];
    }
  }
});
