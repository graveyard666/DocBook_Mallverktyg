/**
 * Opens an OS folder picker imperatively (without JSX).
 * Setting webkitdirectory via JSX / useEffect is unreliable inside iframes
 * because React may strip the attribute or the browser may ignore a late-set
 * attribute. Creating the element in plain JS and setting the property before
 * calling .click() is the only approach that works consistently.
 */
export function openFolderPicker(onFiles: (files: FileList) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  // Both spellings needed for cross-browser support
  (input as any).webkitdirectory = true;
  input.setAttribute('webkitdirectory', '');
  input.setAttribute('directory', '');

  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener(
    'change',
    () => {
      if (input.files && input.files.length > 0) {
        onFiles(input.files);
      }
      document.body.removeChild(input);
    },
    { once: true }
  );

  // Small timeout so the browser has a chance to register the element
  setTimeout(() => input.click(), 0);
}
