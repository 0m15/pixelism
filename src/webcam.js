import { createRef, useEffect, useMemo } from 'react'
const { VideoTexture } = require('three')

const video = document.createElement('video')

let activated = createRef(false)

export default function useWebcamTexture() {
  useEffect(() => {
    document.addEventListener('click', init)

    function init() {
      if (activated.current === true) return

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } }

        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(function (stream) {
            // apply the stream to the video element used in the texture
            video.srcObject = stream
            video.play()
            activated.current = true
          })
          .catch(function (error) {
            console.error('Unable to access the camera/webcam.', error)
          })
      } else {
        console.error('MediaDevices interface not available.')
      }
    }

    return () => {
      document.removeEventListener('click', init)
    }
  }, [])

  return useMemo(() => new VideoTexture(video), [])
}
