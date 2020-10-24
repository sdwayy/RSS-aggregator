const createFeedElement = (feedData) => {
  const {
    title, description, url,
  } = feedData;

  const feedElement = document.createElement('div');
  const titleElement = document.createElement('h2');
  const descriptionElement = document.createElement('p');

  feedElement.className = 'feed mb-4';
  feedElement.dataset.feedUrl = url;
  titleElement.textContent = title;
  descriptionElement.textContent = description;

  feedElement.append(titleElement, descriptionElement);

  return feedElement;
};

const createPostElement = (postData) => {
  const {
    title, link,
  } = postData;

  const postElement = document.createElement('div');
  const postLinkElement = document.createElement('a');

  postLinkElement.href = link;
  postLinkElement.textContent = title;
  postElement.append(postLinkElement);

  return postElement;
};

const renderFeed = (feedData, container, state) => {
  const { url: feedUrl } = feedData;
  const { posts } = state;

  const postsDataForCurrentFeed = posts.filter((post) => post.feedUrl === feedUrl);
  const feedElement = createFeedElement(feedData);

  postsDataForCurrentFeed.forEach((postData) => feedElement
    .append(createPostElement(postData)));

  container.prepend(feedElement);
};

export default (state, elements) => {
  const { feeds } = state;
  const { feeds: feedsContainer } = elements;

  feedsContainer.innerHTML = '';
  feeds.forEach((feed) => renderFeed(feed, feedsContainer, state));
};
