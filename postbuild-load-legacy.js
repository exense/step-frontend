function loadJS(FILE_URL) {
  let scriptEle = document.createElement('script');

  scriptEle.setAttribute('src', FILE_URL);
  scriptEle.setAttribute('type', 'text/javascript');

  document.head.appendChild(scriptEle);

  // success event
  scriptEle.addEventListener('load', () => {
    console.log('File loaded');
  });
  // error event
  scriptEle.addEventListener('error', (ev) => {
    console.log('Error on loading file', ev);
  });
}
loadJS('/app/_HASHED_LEGACY_SCRIPTS_JS_');
