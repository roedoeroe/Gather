import test from 'node:test';
import assert from 'node:assert/strict';
import {extractId, normalizeProfile, parseInput, applyLookup, formatIds} from '../account-id-tool/core.js';

// Fictional reconstruction of the current anonymous profile route. No live
// account response, identifiers, names, images or cookies belong in fixtures.
const profile = normalizeProfile('https://www.instagram.com/northbridge/');
const exact = '9007199254740993123';
const view = (id = exact) => ({
  resource: {__dr: 'PolarisProfilePostsTabRoot.react'},
  entryPoint: {__dr: 'PolarisLoggedOutDesktopWWWProfilePostsTabRoot.entrypoint'},
  props: {id, page_logging: {name: 'profilePage', params: {
    profile_id: id, page_id: 'profilePage_' + id, sub_path: 'posts'
  }}}
});
const fixture = () => ({initialRouteInfo: {route: {
  url: '/northbridge/', params: {username: 'northbridge'},
  canonicalRouteName: 'comet.igweb.PolarisLoggedOutDesktopWWWProfileRoute',
  tracePolicy: 'polaris.profilePage', polarisRouteConfig: {pageID: 'profilePage'},
  rootView: view(), hostableView: view()
}}});
const extract = data => extractId('<script type="application/json">' + JSON.stringify(data) + '</script>', profile);

test('Instagram pk is the account ID when hydrated data has a separate id', () => {
  const r = extract({username: 'northbridge', pk: exact, id: '17840000000000001', full_name: 'Northbridge Example', is_private: true});
  assert.equal(r.id, exact);
  assert.equal(r.displayName, 'Northbridge Example');
  assert.equal(r.profileStatus.privacy, 'private');
});
test('matched anonymous profile route resolves before hydration without inventing status', () => {
  const r = extract(fixture());
  assert.equal(r.id, exact);
  assert.equal(r.displayName, '');
  assert.equal(r.profileStatus.privacy, 'unknown');
  assert.equal(r.profileStatus.content, 'unknown');
});
test('route and hydrated pk agree while separate id is excluded from copy', () => {
  const data = fixture(); data.user = {username: 'northbridge', pk: exact, id: '17840000000000001'};
  const entry = parseInput(profile.url).entries[0]; applyLookup(entry, extract(data));
  assert.equal(formatIds([entry]), exact);
});
test('route parsing preserves long unquoted content and logging IDs', () => {
  const raw = JSON.stringify(fixture()).replaceAll('"' + exact + '"', exact);
  assert.equal(extractId('<script>' + raw + '</script>', profile).id, exact);
});
for (const [name, mutate] of [
  ['different username', r => r.params.username = 'southridge'],
  ['different route URL', r => r.url = '/southridge/'],
  ['different platform', r => r.url = 'https://www.facebook.com/northbridge'],
  ['sign-in route', r => r.canonicalRouteName = 'LoginRoute'],
  ['different page type', r => r.tracePolicy = 'polaris.feed'],
  ['missing profile configuration', r => delete r.polarisRouteConfig],
  ['unrelated resource', r => r.rootView.resource.__dr = 'Recommendations.react'],
  ['unrelated entry point', r => r.hostableView.entryPoint.__dr = 'Feed.entrypoint'],
  ['missing hostable view', r => delete r.hostableView],
  ['logging mismatch', r => r.rootView.props.page_logging.params.profile_id = '123'],
  ['page ID mismatch', r => r.hostableView.props.page_logging.params.page_id = 'profilePage_123'],
  ['unsafe URL', r => r.url = 'https://example.test/northbridge/']
]) test('anonymous route rejects ' + name, () => {
  const data = fixture(); mutate(data.initialRouteInfo.route); assert.ok(extract(data).error);
});
test('two conflicting content views remain ambiguous', () => {
  const data = fixture(); data.initialRouteInfo.route.hostableView = view('123');
  assert.match(extract(data).error, /Multiple account IDs/);
});
test('route cannot override a conflicting hydrated account pk', () => {
  const data = fixture(); data.user = {username: 'northbridge', pk: '123', id: '17840000000000001'};
  assert.match(extract(data).error, /Multiple account IDs/);
});
test('matching pk values in separate observations cannot hide a conflicting profile_id', () => {
  assert.ok(extract({username: 'northbridge', pk: exact, profile_id: '123'}).error);
  assert.ok(extract([{username: 'northbridge', pk: exact}, {username: 'northbridge', pk: '123'}]).error);
});
test('logging fields and recommendations alone cannot identify an account', () => {
  assert.ok(extract({username: 'northbridge', page_logging: view().props.page_logging, recommendations: {id: exact}}).error);
});
test('Threads does not inherit Instagram-specific pk semantics', () => {
  const p = normalizeProfile('https://www.threads.com/@northbridge');
  assert.ok(extractId('<script>{"username":"northbridge","pk":"123","id":"456"}</script>', p).error);
});
test('an invalid Instagram pk cannot promote its separate id to an account ID', () => {
  for (const pk of [null, '', 'not-an-account-key', 0, -1, 1.5, {id: exact}])
    assert.ok(extract({username: 'northbridge', pk, id: '17840000000000001'}).error);
});
