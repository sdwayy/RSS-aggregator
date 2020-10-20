import onChange from 'on-change';
import i18next from 'i18next';

const getFeedElement = (feedData) => {
  const {
    title, description, id,
  } = feedData;

  const feedContainer = document.createElement('div');
  const titleElement = document.createElement('h2');
  const descriptionElement = document.createElement('p');

  feedContainer.classList.add('mb-4');
  feedContainer.dataset.feedId = id;
  titleElement.textContent = title;
  descriptionElement.textContent = description;

  feedContainer.append(titleElement, descriptionElement);

  return feedContainer;
};

const getPostElement = (postData) => {
  const {
    title, link, feedID,
  } = postData;

  const postContainer = document.createElement('div');
  const postElement = document.createElement('a');

  postElement.href = link;
  postElement.textContent = title;
  postContainer.append(postElement);
  postContainer.dataset.feedId = feedID;

  return postContainer;
};

const formChangeHandler = (state, elements) => {
  const { status, isValid: formIsValid, errors } = state.form;
  const { urlInput, feedback, btn } = elements;

  switch (status) {
    case 'filling':
      break;
    case 'sending':
      urlInput.disabled = true;
      btn.disabled = true;
      feedback.textContent = `${i18next.t('alerts.sending')}`;
      feedback.className = 'text-warning';
      break;
    case 'success':
      urlInput.disabled = false;
      btn.disabled = false;
      feedback.textContent = `${i18next.t('alerts.success')}`;
      feedback.className = 'text-success';
      urlInput.value = '';
      break;
    case 'failed':
      btn.disabled = false;
      urlInput.disabled = false;
      feedback.textContent = `${i18next.t(`errors.${errors.join('')}`)}`;
      feedback.className = 'text-danger';
      break;
    default:
      throw new Error(`Unknown status: ${status}`);
  }

  if (!formIsValid) {
    urlInput.classList.add('border-danger');
  } else {
    urlInput.classList.remove('border-danger');
  }
};

const feedsChangeHandler = (state, elements) => {
  const { feeds } = state;
  const { feeds: feedsContainer } = elements;

  feeds.forEach((feed) => {
    const { id } = feed;
    if (!feedsContainer.querySelector(`div[data-feed-id="${id}"]`)) {
      feedsContainer.prepend(getFeedElement(feed));
    }
  });
};

const postsChangeHandler = (state) => {
  const { posts } = state;

  posts.forEach((post) => {
    const { feedID, link } = post;

    const postContainer = document.querySelector(`div[data-feed-id="${feedID}"]`);

    if (postContainer && !postContainer.querySelector(`a[href="${link}"]`)) {
      postContainer.append(getPostElement(post));
    }
  });
};

export default (state, elements) => onChange(state, (path) => {
  const rootOfPath = path.replace(/\.\w+/, '');

  switch (rootOfPath) {
    case 'form':
      formChangeHandler(state, elements);
      break;
    case 'load':
      break;
    case 'feeds':
      feedsChangeHandler(state, elements);
      break;
    case 'posts':
      postsChangeHandler(state, elements);
      break;
    default:
      throw new Error(`Unknown path: ${rootOfPath}`);
  }
});
