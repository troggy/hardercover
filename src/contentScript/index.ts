// as in Hardcover
const linkStyle = 'transition-all underline-offset-2 text-gray-800 dark:text-gray-100 text-md underline hover:no-underline decoration-gray-300 dark:decoration-gray-500';

const createExternalLink = (text: string, href: string) => {
  const linkEl = document.createElement('a');
  linkEl.target = "_blank";
  linkEl.href = href;
  linkEl.setAttribute('class', linkStyle);
  linkEl.innerHTML = text;
  return linkEl;
};

const getElementsByXpath = (xpath: string, root: Node | null | undefined) => {
  const resultsRaw = document.evaluate(xpath, root || document, null, XPathResult.ANY_TYPE, null);
  let results, resultsElements = [];
  while (results = resultsRaw.iterateNext()) {
    resultsElements.push(results);
  }
  return resultsElements;
};

const inject = () => {
  // look for a an element with "Type:" contents (we treat as a book edition card)
  const bookMetadataElements = getElementsByXpath("//*[span[text()[contains(.,'Type')]]]", document);

  bookMetadataElements.forEach(bookMetadataEl => {
    if (!bookMetadataEl) return;

      // add a new "Search" field
      const searchField = bookMetadataEl.cloneNode(true);
      searchField.childNodes[0].textContent = 'Search:';
      const searchBooksLinkBox = document.createElement('div');
      searchField.childNodes[1].textContent = '';
      searchField.childNodes[1].appendChild(searchBooksLinkBox);

      const bookTitle = (bookMetadataEl as Element).parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.querySelector("a[href]")?.textContent as string;

      searchBooksLinkBox?.appendChild(
        createExternalLink(
          'Anna\'s Archive',
          `https://annas-archive.li/search?index=&page=1&sort=&display=&q=${bookTitle}`
        )
      );
  
      searchBooksLinkBox?.appendChild(document.createElement('br'));
  
      searchBooksLinkBox?.appendChild(createExternalLink(
        'Flibusta',
        `https://flibusta.is/booksearch?ask=${encodeURIComponent(bookTitle)}`
      ));
  
      const isbn13node = getElementsByXpath(".//*[span[text()[contains(.,'ISBN 13')]]]", bookMetadataEl.parentNode)[0]?.childNodes[1];
      if (isbn13node) {
        const isbn13 = isbn13node.textContent || '';
        isbn13node.replaceChild(
          createExternalLink(
            isbn13,
            `https://annas-archive.li/search?index=&page=1&sort=&display=&q=${isbn13}`
          ),
          isbn13node.childNodes[0]
        );
      }

      bookMetadataEl.parentNode?.appendChild(searchField);
  });
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

// add immediatelly
inject();

// + wait for the changes to add upon (e.g. when client side navigation happens)
observer.observe(document, { childList: true, subtree: true });