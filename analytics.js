// Visitor statistics with PostHog: how many people visit, where they come from,
// and which buttons they press. No cookies, and nothing is stored in the browser.
//
// The key below is a public project key. It can only send events. It cannot read
// any data, so it is safe in the page. Never put a personal API key here.
(function () {
  var PROJECT_KEY = 'phc_oN7jGiaaEk7wioHkZL62WJyuNhKTwob5v89unts7N5jS';

  // Send one named event. Does nothing when PostHog is not loaded.
  window.waqtyTrack = function (name, props) {
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, props || {});
  };

  // Only the real site sends data. Local copies and preview links stay quiet.
  if (!/(^|\.)getwaqty\.app$/.test(location.hostname)) return;

  // PostHog's own loader, unchanged, from posthog.com/docs/libraries/js.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(PROJECT_KEY, {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-08-30',
    persistence: 'memory',              // no cookies, no local storage
    person_profiles: 'identified_only', // visitors stay anonymous
    disable_session_recording: true,    // no screen recordings
  });
})();
