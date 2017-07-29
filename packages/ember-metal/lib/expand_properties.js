import { assert } from 'ember-debug';

/**
@module ember
@submodule ember-metal
*/

var END_WITH_EACH_REGEX = /\.@each$/;

/**
  Expands `pattern`, invoking `callback` for each expansion.

  The only pattern supported is brace-expansion, anything else will be passed
  once to `callback` directly.

  Example

  ```js
  function echo(arg){ console.log(arg); }

  Ember.expandProperties('foo.bar', echo);              //=> 'foo.bar'
  Ember.expandProperties('{foo,bar}', echo);            //=> 'foo', 'bar'
  Ember.expandProperties('foo.{bar,baz}', echo);        //=> 'foo.bar', 'foo.baz'
  Ember.expandProperties('{foo,bar}.baz', echo);        //=> 'foo.baz', 'bar.baz'
  Ember.expandProperties('foo.{bar,baz}.[]', echo)      //=> 'foo.bar.[]', 'foo.baz.[]'
  Ember.expandProperties('{foo,bar}.{spam,eggs}', echo) //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
  Ember.expandProperties('{foo}.bar.{baz}')             //=> 'foo.bar.baz'
  ```

  @method expandProperties
  @for Ember
  @public
  @param {String} pattern The property pattern to expand.
  @param {Function} callback The callback to invoke.  It is invoked once per
  expansion, and is passed the expansion.
*/
export default function expandProperties(pattern, callback) {
  assert(`A computed property key must be a string, you passed ${typeof pattern} ${pattern}`, typeof pattern === 'string');
  assert(
    'Brace expanded properties cannot contain spaces, e.g. "user.{firstName, lastName}" should be "user.{firstName,lastName}"',
    pattern.indexOf(' ') === -1
  );
  // regex to look for double open, double close, or unclosed braces
  assert(
    `Brace expanded properties have to be balanced and cannot be nested, pattern: ${pattern}`,
    pattern.match( /\{[^}{]*\{|\}[^}{]*\}|\{[^}]*$/g ) === null
  );

  let start = pattern.indexOf('{');
  if (start < 0) {
    callback( pattern.replace(END_WITH_EACH_REGEX, '.[]') );
  } else {
    dive('', pattern, start, callback);
  }
}

function dive(prefix, pattern, start, callback) {
  let end = pattern.indexOf('}'),
      i = 0,
      newStart,
      arrayLength;
  let tempArr = pattern.substring(start + 1, end).split(',');
  let after = pattern.substring(end + 1);
  prefix = prefix + pattern.substring(0, start);

  arrayLength = tempArr.length;
  while (i < arrayLength) {
    newStart = after.indexOf('{');
    if (newStart < 0) {
      callback((prefix + tempArr[i++] + after).replace(END_WITH_EACH_REGEX, '.[]'));
    } else {
      dive(prefix + tempArr[i++], after, newStart, callback);
    }
  }
}
