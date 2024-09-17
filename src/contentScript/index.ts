// as in Hardcover
const linkStyle = 'transition-all underline-offset-2 text-gray-800 dark:text-gray-100  text-md underline hover:no-underline decoration-gray-300 dark:decoration-gray-500';

const createExternalLink = (text: string, href: string) => {
  const linkEl = document.createElement('a');
  linkEl.target = "_blank";
  linkEl.href = href;
  linkEl.setAttribute('class', linkStyle);
  linkEl.innerHTML = text;
  return linkEl;
};

const inject = () => {
  let rawElements = document.evaluate("//*[*[*[*[span[text()[contains(.,'Type')]]]]]]", document, null, XPathResult.ANY_TYPE, null);
  let bookMetadata;
  let bookMetadataElements = [];
  while (bookMetadata = rawElements.iterateNext()) {
    bookMetadataElements.push(bookMetadata);
  }

  bookMetadataElements.forEach(bookMetadataEl => {
    if (!bookMetadataEl) return;

    const searchBooksRow = document.createElement('p');
    searchBooksRow.innerHTML = '<span class="font-bold">Search: </span><span></span>';

    const searchBooksLinkBox = searchBooksRow.childNodes[1];

    const isbn13node = [...bookMetadataEl.childNodes[1]?.childNodes[0]?.childNodes || []].find(p => (p.childNodes[0]?.textContent || '')?.indexOf('ISBN 13') >= 0)?.childNodes[1]

    if (isbn13node) {
      const isbn13 = isbn13node.textContent || '';
      isbn13node.replaceChild(
        createExternalLink(
          isbn13,
          `https://libgen.is/search.php?req=${isbn13}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`
        ),
        isbn13node.childNodes[0]
      );
    }

    const bookTitle = bookMetadataEl.childNodes[0].textContent as string;

    searchBooksLinkBox?.appendChild(
      createExternalLink(
        'Libgen',
        `https://libgen.is/search.php?req=${bookTitle}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`
      )
    );

    searchBooksLinkBox?.appendChild(document.createTextNode(', '));

    searchBooksLinkBox?.appendChild(createExternalLink(
      'Flibusta',
      `https://flibusta.is/booksearch?ask=${encodeURIComponent(bookTitle)}`
    ));

    const rightBeforeBookActionButtons = [...bookMetadataEl.childNodes[1].childNodes[0].childNodes || []].slice(-1)[0] as HTMLElement;

    rightBeforeBookActionButtons.insertAdjacentElement('beforebegin', searchBooksRow);
  })
};


let observer = new MutationObserver(mutations => {
  all:
  for (let mutation of mutations) {

    for (let node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      if ((node.textContent || '').indexOf('Type') >= 0) {
        inject();
        break all;
      }
    }
  }

});
observer.observe(document, { childList: true, subtree: true });