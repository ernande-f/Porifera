const hotspots = document.querySelectorAll('.hotspot');
const diagramTitle = document.getElementById('diagram-title');
const diagramDescription = document.getElementById('diagram-description');

hotspots.forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    hotspots.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
    hotspot.setAttribute('aria-pressed', 'true');
    const title = hotspot.dataset.title;
    const description = hotspot.dataset.description;
    diagramTitle.textContent = title;
    diagramDescription.textContent = description;
  });

  hotspot.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hotspot.click();
    }
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-links');

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menu.dataset.open = (!expanded).toString();
  });
}

const galleryItems = document.querySelectorAll('.gallery__item');

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('is-active');
    galleryItems.forEach((figure) => figure.classList.remove('is-active'));
    if (!isActive) {
      item.classList.add('is-active');
    }
  });
});

window.addEventListener('click', (event) => {
  if (!event.target.closest('.gallery__item')) {
    galleryItems.forEach((figure) => figure.classList.remove('is-active'));
  }
});
