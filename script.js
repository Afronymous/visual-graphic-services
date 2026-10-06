window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  setTimeout(() => { loader.style.opacity = '0'; }, 500);
  setTimeout(() => { loader.remove(); }, 1100);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const portfolioUrl = window.KASTUDIO_CONFIG?.googleDrivePortfolioUrl;
if (portfolioUrl) {
  document.querySelectorAll('[data-portfolio-link]').forEach((link) => {
    link.href = portfolioUrl;
  });
}

document.querySelectorAll('.filters button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    const filter = button.dataset.filter;
    document.querySelectorAll('.project').forEach((project) => {
      project.classList.toggle('hide', filter !== 'all' && project.dataset.cat !== filter);
    });
  });
});

const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav nav');

const closeMenu = () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
};

menu.addEventListener('click', () => {
  const willOpen = !nav.classList.contains('open');
  nav.classList.toggle('open', willOpen);
  menu.setAttribute('aria-expanded', String(willOpen));
  menu.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
