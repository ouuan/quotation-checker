import { assert, describe, it } from 'vitest';

import check from './check';

describe('check', () => {
  it('returns true for correct double quotes', () => {
    assert.isTrue(check('“foo” “bar”'));
  });

  it('returns true for correct single quotes', () => {
    assert.isTrue(check('‘foo’ ‘bar’'));
  });

  it('shows error for unmatched right quotes', () => {
    assert.equal(check('foooo “foo” ”bar“'), '1:13 does not match: ooo “foo” ”bar“');
    assert.equal(check('foooo “foo” ‘bar”'), '1:17 does not match: “foo” ‘bar”');
  });

  it('shows error for unmatched left quotes', () => {
    assert.equal(check('“”“'), '1:3 does not match: “”“');
    assert.equal(check('“”“‘“'), '1:5 does not match: “”“‘“');
    assert.equal(check('‘’‘'), '1:3 does not match: ‘’‘');
    assert.equal(check('foooo ‘foo’ “bar’'), '1:13 does not match: ooo ‘foo’ “bar’');
  });

  it('returns true for nested quotes', () => {
    assert.isTrue(check('“foo ‘bar’ ‘baz’”'));
    assert.isTrue(check('‘foo “ba‘baz’r”’'));
  });

  it('shows error for incorrectly nested quotes', () => {
    assert.equal(check('“foo ‘bar’ “baz””'), '1:12 nesting error: foo ‘bar’ “baz””');
    assert.equal(check('‘foo “bar” ‘baz’’'), '1:12 nesting error: foo “bar” ‘baz’’');
    assert.equal(check('“foo‘ba“qwq‘b‘qaq’az’”r’”'), '1:14 nesting error: o‘ba“qwq‘b‘qaq’az’”r’');
  });

  it('shows error for unmatched quotes inside outer quotes', () => {
    assert.equal(check('‘foo ”bar”’'), '1:6 does not match: ‘foo ”bar”’');
  });

  it('returns true for correct multiline', () => {
    assert.isTrue(check('“foo”\n“bar”\n‘foo’\n‘bar’'));
    assert.isTrue(check('“foo ‘bar’ ‘baz’”\n‘foo “ba‘baz’r”’'));
  });

  it('shows error for incorrect multiline', () => {
    assert.equal(check('“foo”\n”bar“'), '2:1 does not match: ”bar“');
    assert.equal(check('‘foo’\n‘bar‘\n‘baz‘'), '2:5 nesting error: ‘bar‘\n3:5 nesting error: ‘baz‘');
  });

  it('checks each line separately', () => {
    assert.isTrue(check('“\t”'));
    assert.equal(check('“\n”'), '1:1 does not match: “\n2:1 does not match: ”');
  });

  it('recogonize different endls', () => {
    assert.equal(check('“\r”'), '1:1 does not match: “\n2:1 does not match: ”');
    assert.equal(check('foo\r\n“\r”'), '2:1 does not match: “\n3:1 does not match: ”');
    assert.equal(check('foo\n\r“\r”'), '3:1 does not match: “\n4:1 does not match: ”');
  });

  it('forgives ’ as apostrophe', () => {
    assert.isTrue(check('“foo’s”'));
    assert.isTrue(check('“I’d”'));
    assert.isTrue(check('‘foos’'));
    assert.isTrue(check('‘foos’’'));
    assert.isTrue(check('‘foo’s’'));
    assert.isTrue(check('‘foo “I’d”’'));
    assert.equal(check('‘foo “I‘d”’'), '1:10 does not match: ‘foo “I‘d”’');
  });
});
