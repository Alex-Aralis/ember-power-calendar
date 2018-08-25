import DaysComponent from '../power-calendar/days';
import { build, isSelected } from './range-behavior';

export default DaysComponent.extend({
  // Methods
  buildDay: build,
  dayIsSelected: isSelected
});
