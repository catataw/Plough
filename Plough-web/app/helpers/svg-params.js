import Ember from 'ember';

export function svgParams([svgParams,mockId]) {
    return svgParams.filterBy('id', mockId)[0];

}

export default Ember.Helper.helper(svgParams);
