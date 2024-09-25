// content.js (updated)
document.addEventListener("mouseup", function (e) {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    fetchDefinition(selectedText, e);
  }
});

function fetchDefinition(word, event) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        let definition = data[0].meanings[0].definitions[0].definition;
        let audioUrl = data[0].phonetics.find((p) => p.audio)?.audio || "";
        showDefinition(word, definition, event, audioUrl);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function showDefinition(word, definition, event, audioUrl) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let rect = range.getBoundingClientRect();

  let popup = document.createElement("div");
  popup.style.cssText = `
    position: absolute;
    background-color: #ffffcc;
    border: 1px solid #e6e6b8;
    border-radius: 4px;
    padding: 12px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  `;

  let closeButton = `
    <span style="
      position: absolute;
      top: 5px;
      right: 5px;
      cursor: pointer;
      font-size: 16px;
      color: #666;
    ">×</span>
  `;

  let speakerButton = `
    <span style="
      cursor: pointer;
      margin-left: 5px;
      font-size: 16px;
    ">🔊</span>
  `;

  popup.innerHTML = `
    ${closeButton}
    <strong>${word}</strong>${speakerButton}<br>
    ${definition}
  `;

  document.body.appendChild(popup);

  // Calculate and set position after the popup is added to the DOM
  let popupRect = popup.getBoundingClientRect();
  let top = rect.top + window.scrollY - popupRect.height - 10; // 10px above the word
  let left = rect.left + window.scrollX + rect.width / 2 - popupRect.width / 2;

  // Ensure the popup doesn't go off-screen
  if (top < window.scrollY) top = rect.bottom + window.scrollY + 10; // 10px below if not enough space above
  if (left < window.scrollX) left = window.scrollX + 10;
  if (left + popupRect.width > window.innerWidth + window.scrollX)
    left = window.innerWidth + window.scrollX - popupRect.width - 10;

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;

  // Close button functionality
  popup.querySelector("span:first-child").addEventListener("click", () => {
    document.body.removeChild(popup);
  });

  // Speaker button functionality
  if (audioUrl) {
    popup.querySelector("span:nth-child(3)").addEventListener("click", () => {
      let audio = new Audio(audioUrl);
      audio.play();
    });
  } else {
    popup.querySelector("span:nth-child(3)").style.display = "none";
  }

  // Remove the popup when clicking outside
  document.addEventListener("mousedown", function removePopup(e) {
    if (!popup.contains(e.target)) {
      document.body.removeChild(popup);
      document.removeEventListener("mousedown", removePopup);
    }
  });
}

// The manifest.json file remains unchanged
