export default async () => {
  if (typeof window.EventSource === 'undefined') {
    return import(
      /* webpackChunkName: "event-source-polyfill" */ 'event-source-polyfill'
    );
  }
  return Promise.resolve();
};
