/**
 * Generate a custom replacements text area for a work page.
 * @param {HTMLElement} parent
 * @param {boolean} includeAudio whether to include audio pronunciation
 */
function generateCustomReplacements(parent, includeAudio) {
  // Document positioning. Note: this selector only works if we successfully made a glossary earlier.
  const toneGlossary = parent.querySelector("dd.tone-glossary");
  if (toneGlossary === null) {
    console.log(
      "Unable to determine where to insert custom replacements--aborting element generation."
    );
    return;
  }

  const replacements = document.createElement("div");
  replacements.classList.add("custom-replacements");
  replacements.classList.add("hide-custom-replacements");
  toneGlossary.appendChild(replacements);

  const showHideButton = document.createElement("button");
  showHideButton.textContent = "Add custom replacements";
  showHideButton.addEventListener("click", () => {
    if (replacements.classList.contains("hide-custom-replacements")) {
      replacements.classList.remove("hide-custom-replacements");
      showHideButton.textContent = "Hide custom replacements";
    } else {
      replacements.classList.add("hide-custom-replacements");
      showHideButton.textContent = "Add custom replacements";
    }
  });
  document.querySelector("#glossary-button-div").append(showHideButton);

  const customTextArea = document.createElement("textarea");
  replacements.appendChild(customTextArea);
  const apply = document.createElement("button");
  apply.textContent = "Apply";
  replacements.appendChild(apply);
  const status = document.createElement("span");
  status.id = "custom-replacements-status";
  replacements.appendChild(status);

  apply.addEventListener("click", () => {
    status.textContent = "...working...";
    replaceAll(
      splitReplacements(customTextArea.value),
      document.getElementById("main")
    );
    cleanupReplacements(
      Array.from(document.querySelectorAll(".replacement")),
      includeAudio
    ).then(() => {
      // change text after a short delay
      setTimeout(() => {
        status.textContent = "complete ✓";
      }, 400 /* milliseconds */);
    });
  });
}
