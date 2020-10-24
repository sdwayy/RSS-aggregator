import onChange from 'on-change';
import formChangeHandler from './form.js';
import loadChangeHandler from './load.js';
import feedsChangeHandler from './feeds.js';

export default (state, elements) => onChange(state, (path) => {
  const rootOfPath = path.split('.')[0];

  switch (rootOfPath) {
    case 'form':
      formChangeHandler(state, elements);
      break;
    case 'load':
      loadChangeHandler(state, elements);
      break;
    case 'feeds':
    case 'posts':
      feedsChangeHandler(state, elements);
      break;
    default:
      throw new Error(`Unknown path: ${rootOfPath}`);
  }
});
