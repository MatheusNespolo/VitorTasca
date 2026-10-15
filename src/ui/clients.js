export function renderClients(container, clients) {
  const list = hidden => {
    const ul = document.createElement('ul'); ul.className = 'clients-list';
    if (hidden) ul.setAttribute('aria-hidden', 'true');
    for (const c of clients) { const li = document.createElement('li'); li.textContent = c; ul.append(li); }
    return ul;
  };
  container.replaceChildren(list(false), list(true));
}
