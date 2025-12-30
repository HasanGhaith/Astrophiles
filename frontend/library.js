const library = document.getElementById('library');
const uploadCard = document.getElementById('uploadCard');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');

// Trigger file picker when button is clicked
selectBtn.addEventListener('click', () => fileInput.click());

// Handle file selection
fileInput.addEventListener('change', async () => {
  const files = fileInput.files;
  if (!files.length) return;

  let title = prompt("Enter a title for this folder/document (max 20 characters):");
  if (!title) return alert("Title is required!");
  if (title.length > 20) return alert("Title must be 20 characters or fewer");

  // Sanitize title for safe DOM ID
  const cardId = title.replace(/\W/g, '_');

  const formData = new FormData();
  for (const file of files) formData.append('files', file);
  formData.append('title', title);
  formData.append('cardId', cardId);

  try {
    await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });

    // Add the card to the page
    addCard(title, files, cardId);
    fileInput.value = ''; // reset input
  } catch (err) {
    console.error(err);
    alert("Upload failed!");
  }
});

// Function to create a card
function addCard(title, files, cardId) {
  if (document.getElementById(cardId)) return; // avoid duplicates

  const card = document.createElement('div');
  card.className = 'file-card';
  card.id = cardId;
  card.dataset.files = JSON.stringify(Array.from(files).map(f => f.name));

  const h3 = document.createElement('h3');
  h3.textContent = title;
  card.appendChild(h3);

  const p = document.createElement('p');
  p.textContent = `${files.length} file(s) uploaded`;
  card.appendChild(p);

  // Click event to show modal
  card.addEventListener('click', () => showDetails(card));

  library.insertBefore(card, uploadCard);
}

// Show modal with file info
function showDetails(card) {
  const existingOverlay = document.querySelector('.modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const files = JSON.parse(card.dataset.files);
  modal.innerHTML = `<h2>${card.querySelector('h3').textContent}</h2>`;

  files.forEach(filename => {
    const fileDiv = document.createElement('div');
    fileDiv.style.margin = '10px 0';

    const name = document.createElement('p');
    name.textContent = filename;
    fileDiv.appendChild(name);

    const view = document.createElement('a');
    view.href = `http://localhost:3000/uploads/${filename}`;
    view.target = '_blank';
    view.textContent = 'View';
    view.style.marginRight = '10px';
    fileDiv.appendChild(view);

    const download = document.createElement('a');
    download.href = `http://localhost:3000/uploads/${filename}`;
    download.download = filename;
    download.textContent = 'Download';
    fileDiv.appendChild(download);

    modal.appendChild(fileDiv);
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => overlay.remove());
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close when clicking outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// On page load, fetch existing uploaded files
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:3000/files');
    const data = await res.json();

    // data should be array of { title, cardId, files }
    data.forEach(entry => {
      const filesArray = entry.files.map(f => new File([], f));
      addCard(entry.title, filesArray, entry.cardId);
    });
  } catch (err) {
    console.error(err);
  }
});

//  cd C:\Users\A\Desktop\GCweb\myLibraryBackend
 ////////node server.js  git config --global --list


