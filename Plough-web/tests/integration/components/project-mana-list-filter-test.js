import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-mana-list-filter', 'Integration | Component | project mana list filter', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{project-mana-list-filter}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#project-mana-list-filter}}
      template block text
    {{/project-mana-list-filter}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
