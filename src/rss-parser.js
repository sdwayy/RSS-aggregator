export default function parseRss(rss) {
  const domParser = new DOMParser();

  const rssDom = domParser.parseFromString(rss.data, 'text/xml');

  const feedTitleElement = rssDom.querySelector('title');
  const feedDescriptionElement = rssDom.querySelector('description');
  const feedItemsElements = rssDom.querySelectorAll('item');

  const parseItem = (item) => {
    const titleElement = item.querySelector('title');
    const linkElement = item.querySelector('link');

    return {
      title: titleElement.textContent,
      link: linkElement.textContent,
    };
  };

  return {
    title: feedTitleElement.textContent,
    description: feedDescriptionElement.textContent,
    items: [...feedItemsElements].map(parseItem),
  };
}
