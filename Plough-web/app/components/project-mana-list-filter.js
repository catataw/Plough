import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['project-mana-list-filter'],
    filterLists: [],
    actions: {
        removeFilter(filterParam) {
            this.get('filterLists').removeObject(filterParam);
        }
    }
});
