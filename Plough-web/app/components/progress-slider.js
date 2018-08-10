import Ember from 'ember';

export default Ember.Component.extend({
    type: 'range',
    tagName: 'input',
    classNames: ['x-range-input'],
    attributeBindings: ['min', 'max', 'step', 'type', 'name', 'list', 'disabled'],
  
    /**
     * The minimum value that this component's `value` property may
     * have.
     *
     * @property min
     * @type {Number}
     * @default 0
     */
    min: 0,
  
    /**
     * The maximum value (inclusive) that this component's `value` may
     * have.
     *
     * @property max
     * @type {Number}
     * @default 100
     */
    max: 100,
  
    /**
     * The "granularity". The value of the input will be a multiple of
     * this number.
     *
     * @property step
     * @type {Number}
     * @default 0
     */
    step: 1,
  
    /**
     * The current value of the input. It will lie on or between `min`
     * and `max` and will be a multiple of `step`.
     *
     * @property value
     * @type {Number}
     * @default 0
     */
    value: 0,
  
    /**
     * On init and observing each update of `value`, copy to the
     * `element.value` attribute
     *
     * @private
     */
    copyValue: Ember.observer('value', function() {
        Ember.set(this, 'element.value', Ember.get(this, 'value'));
    }),
  
    /**
     * Fix for IE 10-11 browsers.
     *
     * IE 10 and 11 flat out do not fire `input` events on `range`
     * inputs. But it does fire `change` events exactly like the `input`
     * event. So we'll use the change event in only Trident browsers and
     * call our input method.
     *
     * As much as I would like to avoid UA sniffing, even Modernizer
     * labels events as "undetectable" for feature detecting:
     * https://github.com/Modernizr/Modernizr/issues/210
     *
     * @private
     * @reference http://www.impressivewebs.com/onchange-vs-oninput-for-range-sliders/
     */
    change() {
      if (navigator.userAgent.indexOf('Trident/') !== -1) {
        // needs to be called with context for some reason
        Ember.get(this, 'input').call(this);
      }
    },
  
    /**
     * On any `input` event, take the component and the element `value` and send
     * it in an action.
     *
     * @private
     */
    input() {
      let newValue = Number(Ember.get(this, 'element.value')).valueOf();
      let action = Ember.get(this, 'action')
      
      if(typeof(action) === 'function') {
        action(newValue, this);
      }
    },
  
    /**
     * Make sure that the element.value is Ember.set as soon as the element
     * becomes available.
     *
     * @override
     */
    didInsertElement() {
      this.copyValue();
    }

});
