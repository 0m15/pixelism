import { createRef, useCallback, useEffect, useMemo, useRef } from 'react'

let mediaRecorder = createRef()
let recordedBlobs

export default function useRecorder() {
  const stream = useMemo(() => {
    const canvas = document.getElementsByTagName('canvas')[0]
    return canvas.captureStream(25)
  }, [])

  const stop = useCallback(() => {
    mediaRecorder.current.stop()
  }, [])

  const start = useCallback(() => {
    recordedBlobs = []
    let options = { mimeType: 'video/webm;codecs=vp9,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`)
      options = { mimeType: 'video/webm;codecs=vp8,opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`)
        options = { mimeType: 'video/webm' }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`)
          options = { mimeType: '' }
        }
      }
    }

    try {
      mediaRecorder.current = new MediaRecorder(stream, options)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e)
      return
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options)

    mediaRecorder.current.onstop = (event) => {
      console.log('Recorder stopped: ', event)
      console.log('Recorded Blobs: ', recordedBlobs)
    }
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data)
      }
    }
    mediaRecorder.current.start()
    console.log('MediaRecorder started', mediaRecorder)
  }, [])

  const download = useCallback(() => {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'test.webm'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
  }, [])

  return {
    start,
    stop,
    download
  }
}
