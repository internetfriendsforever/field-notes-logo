// Hack for enabling web audio for iOS ¯\_(ツ)_/¯
// https://paulbakaus.com/tutorials/html5/web-audio-on-ios/

const relevant = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

export default context => {
  if (relevant) {
    document.addEventListener('touchstart', () => {
      const buffer = context.createBuffer(1, 1, 22050)
      const source = context.createBufferSource()

      source.buffer = buffer
      source.connect(context.destination)
      source.start(0)
    }, false)
  }
}
