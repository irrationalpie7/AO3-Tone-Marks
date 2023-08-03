/**
 * Generate a custom replacements text area for a work page.
 * @param {HTMLElement} parent
 * @param {boolean} includeAudio whether to include audio pronunciation
 */
function generateCustomReplacements(parent, includeAudio) {
  // Document positioning. Note: this selector only works on a work page.
  const metaDescriptionList = parent.querySelector("dl.work.meta.group");
  if (metaDescriptionList === null) {
    console.log(
      "Unable to determine where to insert custom replacements--aborting element generation."
    );
    return;
  }

  const customTitle = document.createElement("dt");
  customTitle.textContent = "Custom replacements:";
  customTitle.classList.add("tone-custom");
  metaDescriptionList.appendChild(customTitle);
  const customContents = document.createElement("dd");
  customContents.classList.add("tone-custom");
  metaDescriptionList.appendChild(customContents);
  const customTextArea = document.createElement("textarea");
  const div = document.createElement("div");
  div.appendChild(customTextArea);
  customContents.appendChild(div);
  const apply = document.createElement("button");
  apply.textContent = "Apply";
  div.appendChild(apply);
  const status = document.createElement("span");
  div.appendChild(status);

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
      status.textContent = "complete ✓";
    });
  });
}
