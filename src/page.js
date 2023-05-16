function addSection() {
  fetch('/addSection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
          resultsDiv.style.display = 'block';
        }
      } else {
        console.error('Failed to add section:', data.error);
      }
    })
    .catch(error => {
      console.error('Network error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const addSectionBtn = document.getElementById('addSectionBtn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', addSection);
  }
});
