import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-mana-filter-select', 'Integration | Component | project mana filter select', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{project-mana-filter-select}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#project-mana-filter-select}}
      template block text
    {{/project-mana-filter-select}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
