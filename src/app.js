import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import en from './locales/en.js';
import parseRss from './rss-parser.js';
import createWatcher from './watchers.js';

const UPDATE_DELAY_MS = 5000;

const getProxyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com/';

  return `${proxy}${url}`;
};

const validateUrl = (url, feeds) => {
  const urlList = feeds.map((feed) => feed.id);

  const schema = yup
    .string()
    .notOneOf(urlList, 'feedAlreadyExist')
    .required('emptyUrl')
    .url('invalidUrl');

  try {
    schema.validateSync(url);
    return 'valid';
  } catch (error) {
    return error.message;
  }
};

const getFeedPosts = (rssData, rssUrl) => rssData
  .items
  .map((post) => ({ ...post, feedID: rssUrl }));

export default function app() {
  const elements = {
    form: document.querySelector('form'),
    feeds: document.querySelector('.feeds'),
    urlInput: document.querySelector('input[name=url]'),
    btn: document.querySelector('button[type=submit]'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      url: null,
      status: 'filling',
      errors: [],
      isValid: false,
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
      const feedPosts = getFeedPosts(rssData, feedUrl);

      stateWatcher.feeds.push({
        id: feedUrl,
        title,
        description,
      });
      stateWatcher.posts = [...state.posts, ...feedPosts];
      stateWatcher.form.status = 'success';
    })
    .catch(() => {
      stateWatcher.form.status = 'failed';
      stateWatcher.form.errors = ['networkProblem'];
    });

  const updatePosts = (feedUrl) => axios
    .get(getProxyUrl(feedUrl))
    .then((response) => {
      const rssData = parseRss(response);
      const feedPosts = getFeedPosts(rssData, feedUrl);
      const newPosts = _.differenceWith(feedPosts, state.posts, _.isEqual);

      if (newPosts.length > 0) {
        stateWatcher.posts = [...state.posts, ...newPosts];
      }
    })
    .catch(() => {
      throw new Error('updatePostsFailed');
    });

  const autoPostsUpdate = (feedUrl) => setTimeout(() => {
    updatePosts(feedUrl)
      .then(() => autoPostsUpdate(feedUrl))
      .catch((error) => {
        stateWatcher.form.errors = [error.message];
      });
  }, UPDATE_DELAY_MS);

  const submitHandler = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const url = formData.get('url').trim();
    const urlValidationResult = validateUrl(url, state.feeds);

    stateWatcher.form.url = url;

    if (urlValidationResult === 'valid') {
      stateWatcher.form.isValid = true;
      stateWatcher.form.errors = [];
    } else {
      stateWatcher.form.isValid = false;
      stateWatcher.form.errors = [urlValidationResult];
    }

    if (state.form.isValid) {
      stateWatcher.form.status = 'sending';
      requestFeed(url)
        .then(() => autoPostsUpdate(url));
    } else {
      stateWatcher.form.status = 'failed';
    }
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  elements.form.addEventListener('submit', submitHandler);
}
