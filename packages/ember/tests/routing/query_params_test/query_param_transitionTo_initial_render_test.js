import { Route } from 'ember-routing';
import { QueryParamTestCase, moduleFor } from 'internal-test-helpers';
import { get } from 'ember-metal';

moduleFor('Query Params - transitionTo queryParams on inital render', class extends QueryParamTestCase {
  setupBase(url) {
    this.router.map(function() {
      this.route('foo', function() {
        this.route('bar');
        this.route('baz');
      });
    });

    this.registerRoute('foo.baz', Route.extend({
      beforeModel() {
        this.transitionTo('foo.bar');
      }
    }));

    this.registerRoute('foo.bar', Route.extend({ }));

    this.setSingleQPController('foo', 'foo', 'default');

    return this.visit(url);
  }

  ['@test GH#14875 transitionTo on initial render keeps query params'](assert) {
    return this.setupBase('/foo/baz?foo=Not%20Default%20Value').then(() => {
      this.assertCurrentPath('/foo/bar?foo=Not%20Default%20Value');

      let fooController = this.getController('foo');
      assert.equal(get(fooController, 'foo'), 'Not Default Value');
    });
  }
});
