
/**
 * Surround span with a button that plays/pauses the audio.
 * @param {HTMLElement} span
 */
function addAudioButtonAround(span) {
  const button = document.createElement('button');
  button.classList.add('tone-audio-button');

  // Group the pinyin and the progress indicator so they're the same length.
  const progressGroup = document.createElement('div');
  progressGroup.classList.add('audio-progress-group');
  button.appendChild(progressGroup);

  // Add an audio playback progress indicator that starts out hidden.
  const progress = document.createElement('progress');
  progress.value = 0;
  progress.max = 100;
  progress.classList.add('hidden-progress');
  progress.classList.add('audio-progress');
  progress.ariaLabel = 'Audio playback percent'
  progressGroup.appendChild(progress);

  // Wrap the pinyin span in a button:
  // First, replace, so the original parent still knows *where* to put the
  // button.
  span.parentNode.replaceChild(button, span);
  // Then, insert the span back into the tree as the progressGroup's child.
  progressGroup.appendChild(span);

  // Add an icon to indicate that audio is present.
  // (we have to nest the spans in order for the audio-guide display settings to
  // apply)
  const icon = document.createElement('span');
  icon.classList.add('audio-guide');
  icon.innerHTML = '<span class="material-icons">volume_up</span>';
  // Hide the icon from screen readers, since it doesn't provide additional
  // info.
  icon.ariaHidden = 'true'
  button.appendChild(icon);

  // Add an audio element that we can play/pause.
  // Note: it's fine for the <audio> element to be a child of the button since
  // it doesn't have controls and is thus invisible.
  const audio = document.createElement('audio');
  audio.src = span.dataset.url;
  audio.preload = 'none';
  audio.className = 'tone-audio';
  button.appendChild(audio);
  // Update the progress bar when audio position changes.
  audio.addEventListener('timeupdate', () => {
    progress.value = Math.round(audio.currentTime * 100 / audio.duration);
  });

  // Listen for play/pause click.
  button.addEventListener('click', () => {
    if (progress.classList.contains('hidden-progress')) {
      // Reveal the progress indicator
      progress.classList.remove('hidden-progress');
    }
    if (audio.paused) {
      // Pause all other pronunciation audio.
      Array.from(document.querySelectorAll('.tone-audio')).forEach(audio => {
        audio.pause();
      });
      audio.play();
    } else {
      audio.pause();
    }
  });
}