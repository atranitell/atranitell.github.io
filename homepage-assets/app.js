'use strict';
const navigation = document.querySelector('#navigation');

const dialogTriggers = new WeakMap();
function showDialog(dialog, trigger) {
  dialogTriggers.set(dialog, trigger);
  document.body.classList.add('modal-open');
  dialog.showModal();
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    dialogTriggers.get(dialog)?.focus({ preventScroll: true });
  });
});

const papers = [...document.querySelectorAll('.publication')];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => {
      other.setAttribute('aria-pressed', String(other === button));
    });
    let visibleCount = 0;
    papers.forEach(paper => {
      paper.hidden = filter !== 'all' && paper.dataset.type !== filter;
      if (!paper.hidden) visibleCount++;
    });
    const label = filter === 'all' ? 'selected work' : { journal: 'journal paper', conference: 'conference paper', preprint: 'preprint' }[filter];
    document.querySelector('#publication-count').textContent = `Showing ${visibleCount} ${label}${visibleCount === 1 ? '' : 's'}`;
  });
});

const citations = {
  raslf: `@misc{wei2026raslf,
  title = {RASLF: Representation-Aware State Space Model for Light Field Super-Resolution},
  author = {Wei, Zeqiang and Jin, Kai and Song, Kuan and Zhou, Xiuzhuang and Chen, Wenlong and Xu, Min},
  year = {2026},
  eprint = {2603.16243},
  archivePrefix = {arXiv},
  primaryClass = {cs.CV},
  url = {https://arxiv.org/abs/2603.16243}
}`,
  lftransmamba: `@InProceedings{Jin_2025_CVPR,
  author = {Jin, Kai and Wei, Zeqiang and Yang, Angulia and Wu, Di and Gao, Mingzhi and Zhou, Xiuzhuang},
  title = {LFTransMamba: A Hybrid Mamba-Transformer Model for Light Field Image Super-Resolution},
  booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) Workshops},
  month = {June},
  year = {2025},
  pages = {1195-1204}
}`,
  l2fmamba: `@ARTICLE{Wei_L2FMamba_TCI25,
  author = {Wei, Zeqiang and Jin, Kai and Hou, Zeyi and Song, Kuan and Zhou, Xiuzhuang},
  journal = {IEEE Transactions on Computational Imaging},
  title = {$L^{2}$FMamba: Lightweight Light Field Image Super-Resolution With State Space Model},
  year = {2025},
  volume = {11},
  pages = {816-826},
  doi = {10.1109/TCI.2025.3577338}
}`,
  distgepit: `@InProceedings{Jin_2023_CVPR,
  author = {Jin, Kai and Yang, Angulia and Wei, Zeqiang and Guo, Sha and Gao, Mingzhi and Zhou, Xiuzhuang},
  title = {DistgEPIT: Enhanced Disparity Learning for Light Field Image Super-Resolution},
  booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) Workshops},
  month = {June},
  year = {2023},
  pages = {1373-1383}
}`,
  swinipassr: `@InProceedings{Jin_2022_CVPR,
  author = {Jin, Kai and Wei, Zeqiang and Yang, Angulia and Guo, Sha and Gao, Mingzhi and Zhou, Xiuzhuang and Guo, Guodong},
  title = {SwiniPASSR: Swin Transformer Based Parallax Attention Network for Stereo Image Super-Resolution},
  booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) Workshops},
  month = {June},
  year = {2022},
  pages = {920-929}
}`
};
document.querySelectorAll('[data-bib]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#bib-content').textContent = citations[button.dataset.bib];
    document.querySelector('#bib-status').textContent = '';
    showDialog(document.querySelector('#bib-dialog'), button);
  });
});
document.querySelector('#copy-bib').addEventListener('click', async () => {
  await copyText(document.querySelector('#bib-content').textContent, document.querySelector('#bib-status'), 'BibTeX copied.', 'Clipboard unavailable. Select and copy the citation above.');
});

const galleries = {
  ntire2026: { title: 'NTIRE 2026 · Light Field Image Super-Resolution', original: './homepage-assets/awards/ntire-lfsr-2026.pdf', images: [
    ['./homepage-assets/awards/ntire-lfsr-2026-classic.png', 'Track 1 Classical · Winner Award'],
    ['./homepage-assets/awards/ntire-lfsr-2026-efficiency.png', 'Track 2 Efficiency · Winner Award'],
    ['./homepage-assets/awards/ntire-lfsr-2026-large.png', 'Track 3 Large Model · Winner Award']
  ] },
  ntire2025: { title: 'NTIRE 2025 · Light Field Image Super-Resolution', images: [
    ['./homepage-assets/awards/ntire-lfsr-2025-classic.png', 'Track 1 Classical · Winner Award'],
    ['./homepage-assets/awards/ntire-lfsr-2025-efficiency.png', 'Track 2 Efficiency · Runner-Up Award'],
    ['./homepage-assets/awards/ntire-lfsr-2025-large.png', 'Track 3 Large Model · Winner Award']
  ] },
  ntire2023: { title: 'NTIRE 2023 · Light Field Image Super-Resolution', images: [
    ['./homepage-assets/awards/ntire-lfsr-2023.png', 'Light Field Image Super-Resolution · Winner Award']
  ] },
  urban2022: { title: 'Urban3D 2022 · Urban Scenes Understanding', images: [
    ['./homepage-assets/awards/urban3d-2022-instance.png', 'Instance Segmentation · Winner Award'],
    ['./homepage-assets/awards/urban3d-2022-semantic.png', 'Semantic Segmentation · 2nd Place Award']
  ] },
  stereo2022: { title: 'NTIRE 2022 · Stereo Image Super-Resolution', images: [
    ['./homepage-assets/awards/ntire-stereo-2022.png', 'Stereo Image Super-Resolution · Runner-Up Award']
  ] },
  urban2021: { title: 'Urban3D 2021 · Urban Scenes Understanding', images: [
    ['./homepage-assets/awards/urban3d-2021.png', 'Urban Scenes Understanding · Winner Award']
  ] }
};
let activeGallery;
let certificateIndex = 0;
const certificateDialog = document.querySelector('#certificate-dialog');
const previousCertificate = document.querySelector('#certificate-prev');
const nextCertificate = document.querySelector('#certificate-next');
function renderCertificate() {
  const [source, caption] = activeGallery.images[certificateIndex];
  const image = document.querySelector('#certificate-image');
  image.src = source;
  image.alt = `${activeGallery.title}, ${caption}, original award certificate`;
  document.querySelector('#certificate-caption').textContent = caption;
  document.querySelector('#certificate-counter').textContent = `${certificateIndex + 1} / ${activeGallery.images.length}`;
  previousCertificate.disabled = certificateIndex === 0;
  nextCertificate.disabled = certificateIndex === activeGallery.images.length - 1;
  const original = document.querySelector('#certificate-original');
  original.href = activeGallery.original || source;
  original.textContent = activeGallery.original ? 'Combined certificates PDF' : 'Original image';
}
function changeCertificate(offset) {
  const target = certificateIndex + offset;
  if (target < 0 || target >= activeGallery.images.length) return;
  certificateIndex = target;
  renderCertificate();
}
document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => {
    activeGallery = galleries[button.dataset.gallery];
    certificateIndex = 0;
    document.querySelector('#certificate-title').textContent = activeGallery.title;
    renderCertificate();
    showDialog(certificateDialog, button);
  });
});
previousCertificate.addEventListener('click', () => changeCertificate(-1));
nextCertificate.addEventListener('click', () => changeCertificate(1));
certificateDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); changeCertificate(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); changeCertificate(1); }
});

async function copyText(value, status, success, failure) {
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = success;
    return true;
  } catch {
    status.textContent = failure;
    return false;
  }
}
document.querySelector('#copy-email').addEventListener('click', async () => {
  const copied = await copyText('jinkai@bigo.sg', document.querySelector('#copy-status'), 'Email address copied.', 'Clipboard unavailable. Select and copy the email address above.');
  if (copied) document.querySelector('#copy-email span:last-child').textContent = 'Email copied';
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-12% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
