import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import parseRss from './rss-parser.js';
import createWatcher from './watchers/index.js';

const UPDATE_DELAY_MS = 5000;

const getProxyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com';

  return `${proxy}/${url}`;
};

const validateUrl = (url, feeds) => {
  const urlList = feeds.map((feed) => feed.url);

  const schema = yup
    .string()
    .notOneOf(urlList, 'feedAlreadyExist')
    .required('emptyUrl')
    .url('invalidUrl');

  try {
    schema.validateSync(url);
    return null;
  } catch (error) {
    return error.message;
  }
};

const startUpApp = () => {
  const elements = {
    form: document.querySelector('form'),
    feedsContainer: document.querySelector('.feeds'),
    urlInput: document.querySelector('input[name=url]'),
    submitButton: document.querySelector('button[type=submit]'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      url: null,
      status: 'enabled',
      error: '',
    },
    load: {
      status: 'idle',
      error: '',
    },
    feeds: [],
    posts: [],
  };

  const stateWatcher = createWatcher(state, elements);

  const requestFeed = (feedUrl) => axios
    .get(getProxyUrl(feedUrl))
    .then((response) => {
      const rssData = parseRss(response);
      const { title, description } = rssData;
      const feedPosts = rssData
        .items
        .map((post) => ({ ...post, feedUrl }));

      stateWatcher.feeds.push({
        url: feedUrl,
        title,
        description,
      });
      stateWatcher.posts = [...state.posts, ...feedPosts];
    })
    .catch(() => {
      throw new Error('networkProblem');
    });

  const updatePosts = (feedUrl) => axios
    .get(getProxyUrl(feedUrl))
    .then((response) => {
      const rssData = parseRss(response);
      const feedPosts = rssData
        .items
        .map((post) => ({ ...post, feedUrl }));
      const newPosts = _.differenceWith(feedPosts, state.posts, _.isEqual);

      if (newPosts.length > 0) {
        stateWatcher.posts = [...newPosts, ...state.posts];
      }
    })
    .catch(() => {
      throw new Error('updatePostsFailed');
    });

  const autoUpdatePosts = () => {
    const promises = state.feeds.map((feed) => updatePosts(feed.url));

    return setTimeout(() => {
      Promise.all(promises)
        .then(autoUpdatePosts)
        .catch((error) => {
          stateWatcher.load.error = error.message;
        });
    }, UPDATE_DELAY_MS);
  };

  const submitHandler = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const url = formData.get('url').trim();
    const validationError = validateUrl(url, state.feeds);

    stateWatcher.form.url = url;

    if (!validationError) {
      stateWatcher.form.status = 'valid';
      stateWatcher.form.error = '';
    } else {
      stateWatcher.form.status = 'invalid';
      stateWatcher.form.error = validationError;
    }

    if (state.form.status === 'valid') {
      stateWatcher.load.status = 'pending';
      stateWatcher.form.status = 'disabled';

      requestFeed(url)
        .then(() => {
          stateWatcher.load.status = 'success';
        })
        .catch((error) => {
          stateWatcher.load.status = 'failed';
          stateWatcher.load.error = error.message;
        })
        .finally(() => {
          stateWatcher.form.status = 'enabled';
        });
    }
  };

  window.addEventListener('load', autoUpdatePosts);
  elements.form.addEventListener('submit', submitHandler);
};

export default new Promise((resolve) => {
  i18next.init({
    lng: 'en',
    resources,
  })
    .then(startUpApp)
    .then(resolve);
});
