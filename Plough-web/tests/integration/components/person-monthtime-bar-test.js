import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('person-monthtime-bar', 'Integration | Component | person monthtime bar', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{person-monthtime-bar}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#person-monthtime-bar}}
      template block text
    {{/person-monthtime-bar}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
