// content.js (updated)
document.addEventListener("mouseup", function (e) {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    fetchDefinitions(selectedText, e);
  }
});
// document.addEventListener("mouseup", (e) => {
//   let seletectedText = window.getSelection().toString().trim();
//   if (seletectedText.length > 0) {
//     fetchDefinitions(seletectedText, e);
//   }
// });

const fetchDefinitions = async (word, event) => {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      let definitions = data[0].meanings
        .flatMap((meaning) => meaning.definitions.map((def) => def.definition))
        .slice(0, 4); // Get up to 4 definitions
      let audioUrl = data[0].phonetics.find((p) => p.audio)?.audio || "";
      showDefinition(word, definitions, event, audioUrl);
    }
  } catch (error) {
    throw new Error(`Failed to fetch definitions: ${error.message}`);
  }
};

function showDefinition(word, definitions, event, audioUrl) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let rect = range.getBoundingClientRect();

  let popup = document.createElement("div");
  popup.style.cssText = `
    position: absolute;
    background-color: #ffffcc;
    border: 1px solid #e6e6b8;
    border-radius: 4px;
    padding-top: 12px;
    padding-bottom: 24px;
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

  let moreButton = `
    <span style="
      position: absolute;
      bottom: 3px;
      right: 5px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
    ">>></span>
  `;
  // this function creates the inner content of the popup
  function createContent(showAll = false) {
    let definitionsToShow = showAll ? definitions : [definitions[0]];
    return `
      ${closeButton}
      <strong>${word}</strong>${speakerButton}<br>
      ${definitionsToShow
        .map((def, index) => `${index + 1}. ${def}`)
        .join("<br>")}
      ${definitions.length > 1 ? moreButton : ""}
    `;
  }

  popup.innerHTML = createContent();
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

  // More button functionality
  if (definitions.length > 1) {
    popup.querySelector("span:last-child").addEventListener("click", () => {
      popup.innerHTML = createContent(true);
      popup.querySelector("span:last-child").style.display = "none"; // Hide "more" button after showing all definitions
    });
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
