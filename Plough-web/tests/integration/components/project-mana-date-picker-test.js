import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-mana-date-picker', 'Integration | Component | project mana date picker', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{project-mana-date-picker}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#project-mana-date-picker}}
      template block text
    {{/project-mana-date-picker}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
