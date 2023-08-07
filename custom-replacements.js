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
  replacements.classList.add("hidden-feature");
  replacements.classList.add("hide-custom-replacements");
  toneGlossary.appendChild(replacements);

  const showHideButton = document.createElement("button");
  showHideButton.textContent = "Add custom replacements (experimental feature)";
  showHideButton.classList.add("hidden-feature");
  showHideButton.addEventListener("click", () => {
    if (replacements.classList.contains("hide-custom-replacements")) {
      replacements.classList.remove("hide-custom-replacements");
      showHideButton.textContent =
        "Hide custom replacements  (experimental feature)";
    } else {
      replacements.classList.add("hide-custom-replacements");
      showHideButton.textContent =
        "Add custom replacements (experimental feature)";
    }
  });
  document.querySelector("#glossary-button-div").append(showHideButton);

  const details = document.createElement("details");
  details.setAttribute("open", "open");
  details.innerHTML = `<summary>
                         Custom replacements
                       </summary>
                       <p>Below you can add custom replacement rules, whether for missing rules (consider <a href="https://github.com/Cathalinaheart/AO3-Tone-Marks#contributing">contributing them to the project!</a>) or one-off original characters. Each rule goes on its own line; an example would be "wen ke xing|Wēn Kèxíng" (without the quotes). The left part describes what to match, the right part describes what the replacement should be. There is more <a href="https://github.com/Cathalinaheart/AO3-Tone-Marks#the-fandomtxt-file-format">information on formatting replacement rules</a> here.</p>
                       <p><strong>Warning:</strong> your changes will not be saved if you leave or reload the page, so make sure to copy them somewhere else if you want to keep them.</p>`;
  replacements.appendChild(details);

  const beforeUnloadListener = (event) => {
    event.preventDefault();
    return (event.returnValue = "");
  };
  const customTextArea = document.createElement("textarea");
  customTextArea.id = "custom-replacements-textarea";
  customTextArea.value = "";
  replacements.appendChild(customTextArea);
  customTextArea.addEventListener("input", (event) => {
    // If the textarea's value is not "", warn the user before leaving the page
    // Note: if we ever allow saving this info, we should instead compare to the loaded
    // value. Although that could cause issues if people had multiple tabs open...
    if (event.target.value !== "") {
      addEventListener("beforeunload", beforeUnloadListener, { capture: true });
    } else {
      removeEventListener("beforeunload", beforeUnloadListener, {
        capture: true,
      });
    }
  });

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
