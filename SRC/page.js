function addParagraph() {
    fetch('/add-paragraph', { method: 'POST' })
      .then(response => response.text())
      .then(text => {
        const newParagraph = document.createElement('p');
        newParagraph.textContent = text;
        document.querySelector('#new-paragraph-container').appendChild(newParagraph);
      })
      .catch(error => console.error(error));
  }