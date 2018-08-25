import MonthsComponent from '../power-calendar/months';
import { build, isSelected } from './range-behavior';

export default MonthsComponent.extend({
  // Methods
  buildMonth: build,
  monthIsSelected: isSelected
});