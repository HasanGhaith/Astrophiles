const library = document.getElementById('library');
const uploadCard = document.getElementById('uploadCard');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');

selectBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const files = fileInput.files;
  if (!files.length) return;

  const title = prompt("Enter title (max 20 chars):");
  if (!title || title.length > 20) return;

  const cardId = title.replace(/\W/g, '_');

  const formData = new FormData();
  [...files].forEach(f => formData.append('files', f));
  formData.append('title', title);
  formData.append('cardId', cardId);

  await fetch('/upload', { method: 'POST', body: formData });

  addCard(title, [...files].map(f => f.name), cardId);
  fileInput.value = '';
});

function addCard(title, files, cardId) {
  if (document.getElementById(cardId)) return;

  const card = document.createElement('div');
  card.className = 'file-card';
  card.id = cardId;
  card.dataset.files = JSON.stringify(files);

  card.innerHTML = `
    <h3>${title}</h3>
    <p>${files.length} file(s)</p>
  `;

  card.onclick = () => showDetails(card);
  library.insertBefore(card, uploadCard);
}

function showDetails(card) {
  document.querySelector('.modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const files = JSON.parse(card.dataset.files);
  modal.innerHTML = `<h2>${card.querySelector('h3').textContent}</h2>`;

  files.forEach(filename => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';

    row.innerHTML = `
      <span>${filename}</span>
      <a href="/uploads/${filename}" target="_blank">View</a>
      <a href="/uploads/${filename}" download>Download</a>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';

    removeBtn.onclick = async (e) => {
      e.stopPropagation();

      await fetch('/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, cardId: card.id })
      });

      row.remove();

      const updated = files.filter(f => f !== filename);
      card.dataset.files = JSON.stringify(updated);

      if (!updated.length) {
        card.remove();
        overlay.remove();
      }
    };

    row.appendChild(removeBtn);
    modal.appendChild(row);
  });

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.onclick = () => overlay.remove();
  modal.appendChild(close);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Load saved data
document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/files');
  const data = await res.json();

  data.forEach(entry =>
    addCard(entry.title, entry.files, entry.cardId)
  );
});

//  cd C:\Users\A\Desktop\GCweb\myLibraryBackend
 ////////node server.js  git config --global --list


