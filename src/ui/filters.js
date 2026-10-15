export function renderFilters(container, niches, active, onChange) {
  const hadFocus = container.contains(document.activeElement);
  const items = [['todos', 'Todos'], ...niches.map(n => [n.slug, n.label])];
  container.replaceChildren(...items.map(([value, label]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = label;
    b.setAttribute('aria-pressed', String(value === active));
    b.addEventListener('click', () => onChange(value));
    return b;
  }));
  if (hadFocus) container.querySelector('[aria-pressed="true"]')?.focus();
}
