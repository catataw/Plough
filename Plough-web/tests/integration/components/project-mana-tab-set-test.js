import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-mana-tab-set', 'Integration | Component | project mana tab set', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{project-mana-tab-set}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#project-mana-tab-set}}
      template block text
    {{/project-mana-tab-set}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
