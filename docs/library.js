const library = document.getElementById('library');
const uploadCard = document.getElementById('uploadCard');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');

// THIS COMES FROM HTML
const CURRENT_CATEGORY = document.body.dataset.category;


selectBtn.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const files = [...fileInput.files];
  if (!files.length) return;

  const title = prompt('Enter title (max 20 chars)');
  if (!title || title.length > 20) return;

  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  formData.append('title', title);
  formData.append('category', CURRENT_CATEGORY);

  await fetch('/upload', { method: 'POST', body: formData });
  location.reload(); // SIMPLE & SAFE
};

// Create card
function addCard(card) {
  const div = document.createElement('div');
  div.className = 'file-card';
  div.innerHTML = `
    <h3>${card.title}</h3>
    <p>${card.files.length} file(s)</p>
  `;
  div.onclick = () => openModal(card);
  library.insertBefore(div, uploadCard);
}

// Modal
function openModal(card) {
  document.querySelector('.modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<h2>${card.title}</h2>`;

  card.files.forEach(f => {
    const row = document.createElement('div');
    row.innerHTML = `
      <span>${f}</span>
      <a href="/uploads/${f}" target="_blank">View</a>
      <a href="/uploads/${f}" download>Download</a>
      <button>Remove</button>
    `;

    row.querySelector('button').onclick = async e => {
      e.stopPropagation();
      await fetch('/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: f, cardId: card.cardId })
      });
      location.reload();
    };

    modal.appendChild(row);
  });

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.onclick = () => overlay.remove();

  modal.appendChild(close);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// LOAD on refresh
fetch('/files')
  .then(r => r.json())
  .then(data => {
    data
      .filter(c => c.category === CURRENT_CATEGORY)
      .forEach(addCard);
  }); 


//  cd C:\Users\A\Desktop\GCweb\myLibraryBackend
 ////////node server.js 


