import AdaptiveStore from 'ember-simple-auth/session-stores/adaptive';
export default AdaptiveStore.extend({
  localStorageKey:'pmo-session',
  cookieDomain:'pmo.cmss',
  cookieName:'pmo-session'
});
