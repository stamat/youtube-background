import { VideoBackgrounds } from '../video-backgrounds.mjs'
import { VideoBackground, MIME_MAP } from '../lib/video-background.mjs'
import { SuperVideoBackground } from '../lib/super-video-background.mjs'
import { RE_VIDEO } from 'book-of-spells'

// These methods never touch `this` beyond plain data, so they can be exercised
// off the prototype with a stub receiver - no player APIs, no fixtures.
const getVidID = (link) => VideoBackgrounds.prototype.getVidID.call(null, link)
const parseProperties = (...args) => SuperVideoBackground.prototype.parseProperties.call(null, ...args)
const setMimeType = (source) => {
  const stub = { MIME_MAP }
  VideoBackground.prototype.setMimeType.call(stub, source)
  return stub
}

describe('getVidID', () => {
  test('returns undefined instead of throwing on a missing link', () => {
    expect(getVidID(null)).toBeUndefined()
    expect(getVidID(undefined)).toBeUndefined()
    expect(getVidID('')).toBeUndefined()
  })

  test('identifies each supported source type', () => {
    expect(getVidID('https://youtu.be/dQw4w9WgXcQ').type).toBe('YOUTUBE')
    expect(getVidID('https://www.youtube.com/watch?v=dQw4w9WgXcQ').id).toBe('dQw4w9WgXcQ')
    expect(getVidID('https://vimeo.com/123456789').type).toBe('VIMEO')
    expect(getVidID('https://example.com/clip.mp4').type).toBe('VIDEO')
  })

  test('picks up the Vimeo unlisted hash', () => {
    expect(getVidID('https://vimeo.com/123456789/abc123def').unlisted).toBe('abc123def')
    expect(getVidID('https://vimeo.com/123456789?h=abc123def').unlisted).toBe('abc123def')
  })

  // guards MIME_MAP against drifting away from book-of-spells' RE_VIDEO
  test('matches every container MIME_MAP claims to support', () => {
    for (const ext in MIME_MAP) {
      const data = getVidID(`https://example.com/media/clip.${ext}`)
      expect(data).toBeDefined()
      expect(data.type).toBe('VIDEO')
      expect(data.id).toBe(`clip.${ext}`)
    }
  })
})

describe('RE_VIDEO', () => {
  test('tolerates query strings and hashes', () => {
    expect('https://example.com/clip.mp4?v=2'.match(RE_VIDEO)[1]).toBe('clip.mp4')
    expect('https://example.com/clip.webm#t=10'.match(RE_VIDEO)[1]).toBe('clip.webm')
    expect('https://example.com/clip.MP4'.match(RE_VIDEO)[1]).toBe('clip.MP4')
  })

  test('ignores unknown containers and extensionless URLs', () => {
    expect('https://example.com/clip.mkv'.match(RE_VIDEO)).toBeNull()
    expect('https://example.com/no-extension'.match(RE_VIDEO)).toBeNull()
  })
})

describe('setMimeType', () => {
  test('leaves the MIME undefined rather than throwing on a bare filename', () => {
    expect(setMimeType('no-extension').mime).toBeUndefined()
    expect(setMimeType('clip.mkv').mime).toBeUndefined()
  })

  test('resolves known extensions regardless of case', () => {
    expect(setMimeType('clip.MOV').mime).toBe('video/quicktime')
    expect(setMimeType('clip.mp4').mime).toBe('video/mp4')
  })
})

describe('parseProperties', () => {
  const defaults = { muted: true, loop: true, 'start-at': 0 }

  test('falls back to defaults and honours overrides', () => {
    expect(parseProperties(null, defaults, null, 'data-vbg-')).toEqual(defaults)
    expect(parseProperties({ muted: false }, defaults, null, 'data-vbg-').muted).toBe(false)
    // a key absent from the passed params still gets its default
    expect(parseProperties({ muted: false }, defaults, null, 'data-vbg-').loop).toBe(true)
  })

  test('reads data attributes under either prefix and coerces types', () => {
    const attributes = { 'data-vbg-muted': 'false', 'data-ytbg-start-at': '12' }
    const element = { getAttribute: (name) => (name in attributes ? attributes[name] : null) }

    const params = parseProperties(null, defaults, element, ['data-ytbg-', 'data-vbg-'])
    expect(params.muted).toBe(false)
    expect(params['start-at']).toBe(12)
    expect(params.loop).toBe(true)
  })
})

describe('time and percentage conversion', () => {
  const instance = { params: { 'start-at': 10 }, duration: 110 }
  const toPercentage = (t) => SuperVideoBackground.prototype.timeToPercentage.call(instance, t)
  const toTime = (p) => SuperVideoBackground.prototype.percentageToTime.call(instance, p)

  test('round-trips around start-at', () => {
    expect(toPercentage(50)).toBe(40)
    expect(toTime(40)).toBe(50)
  })

  test('clamps at both ends', () => {
    expect(toPercentage(5)).toBe(0)
    expect(toPercentage(999)).toBe(100)
    expect(toTime(-1)).toBe(10)
    expect(toTime(101)).toBe(110)
  })

  test('returns start-at while the duration is still unknown', () => {
    const pending = { params: { 'start-at': 7 }, duration: 0 }
    expect(SuperVideoBackground.prototype.percentageToTime.call(pending, 50)).toBe(7)
  })

  test('reports 0%, not 100%, while the duration is still unknown', () => {
    const pending = { params: { 'start-at': 0 }, duration: 0 }
    expect(SuperVideoBackground.prototype.timeToPercentage.call(pending, 5)).toBe(0)
  })
})

describe('setDuration', () => {
  const setDuration = (params, duration) => {
    const state = { params, duration: params['end-at'] || 0 }
    SuperVideoBackground.prototype.setDuration.call(state, duration)
    return state.duration
  }

  test('clamps to end-at, or to a shorter video', () => {
    expect(setDuration({ 'end-at': 30 }, 100)).toBe(30)
    expect(setDuration({ 'end-at': 30 }, 20)).toBe(20)
    expect(setDuration({ 'end-at': 0 }, 100)).toBe(100)
  })
})

describe('VideoBackgrounds teardown', () => {
  // jsdom has neither observer, so the factory takes its fallback paths: no
  // IntersectionObserver, and the window resize listener instead of ResizeObserver.
  const stubInstance = (backgrounds, uid) => {
    const element = document.createElement('div')
    element.setAttribute('data-vbg-uid', uid)
    document.body.appendChild(element)

    const instance = {
      element,
      playerElement: document.createElement('iframe'),
      params: { 'always-play': true },
      shouldPlay: () => true,
      softPlay: () => { instance.played += 1 },
      destroy: () => { instance.destroyed = true },
      played: 0,
      destroyed: false
    }

    backgrounds.index[uid] = instance
    return instance
  }

  test('destroyAll reaches instances through the wrapper element', () => {
    const backgrounds = new VideoBackgrounds([])
    const instance = stubInstance(backgrounds, 'vbg-test-1')

    backgrounds.destroyAll()

    expect(instance.destroyed).toBe(true)
    expect(backgrounds.index['vbg-test-1']).toBeUndefined()
  })

  test('disconnect stops the factory responding to visibilitychange', () => {
    const backgrounds = new VideoBackgrounds([])
    const instance = stubInstance(backgrounds, 'vbg-test-2')

    document.dispatchEvent(new Event('visibilitychange'))
    expect(instance.played).toBe(1)

    backgrounds.disconnect()
    document.dispatchEvent(new Event('visibilitychange'))
    expect(instance.played).toBe(1)
  })
})

describe('shouldPlay', () => {
  const shouldPlay = (state) => SuperVideoBackground.prototype.shouldPlay.call(state)

  const playable = {
    paused: false,
    currentState: 'paused',
    isIntersecting: true,
    params: { loop: true, autoplay: true, 'always-play': false }
  }

  test('plays an intersecting, autoplaying video', () => {
    expect(shouldPlay(playable)).toBe(true)
  })

  test('never overrides an explicit user pause', () => {
    expect(shouldPlay({ ...playable, paused: true })).toBe(false)
  })

  test('leaves an already playing or off-screen video alone', () => {
    expect(shouldPlay({ ...playable, currentState: 'playing' })).toBe(false)
    expect(shouldPlay({ ...playable, isIntersecting: false })).toBe(false)
  })

  test('plays off-screen when pinned with always-play', () => {
    expect(shouldPlay({
      ...playable,
      isIntersecting: false,
      params: { ...playable.params, 'always-play': true }
    })).toBe(true)
  })

  test('stays ended when looping is off', () => {
    expect(shouldPlay({
      ...playable,
      currentState: 'ended',
      params: { ...playable.params, loop: false }
    })).toBe(false)
  })
})
