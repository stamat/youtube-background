// Covers the bugs that have actually shipped here: URL parsing, MIME and param
// resolution, time/percentage arithmetic, the loop and pause decisions, source
// attribute round-tripping, group wrap-around, and factory teardown.
//
// Deliberately not covered: anything needing a real YouTube, Vimeo or media
// player. jsdom has no playback, no IntersectionObserver and no network, so
// those paths are exercised through their decision logic with stub receivers
// instead - what breaks in a real browser is timing, and this cannot see it.

import { VideoBackgrounds } from '../video-backgrounds.mjs'
import { VideoBackground, MIME_MAP } from '../lib/video-background.mjs'
import { YoutubeBackground } from '../lib/youtube-background.mjs'
import { VideoBackgroundGroup } from '../lib/controls.mjs'
import { SuperVideoBackground, SOURCE_ATTRIBUTES } from '../lib/super-video-background.mjs'
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
    expect(getVidID('https://player.vimeo.com/video/123456789?h=abc123def').unlisted).toBe('abc123def')
  })

  test('a public Vimeo URL never grows a hash it does not have', () => {
    expect(getVidID('https://vimeo.com/123456789').unlisted).toBeUndefined()
    // the last two segments look like id/hash, but the id is the last one
    expect(getVidID('https://vimeo.com/channels/staffpicks/123456789').unlisted).toBeUndefined()
    expect(getVidID('https://vimeo.com/groups/motion/videos/123456789').unlisted).toBeUndefined()
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

describe('source attributes', () => {
  const writeBack = (element, url) =>
    SuperVideoBackground.prototype.writeSourceAttributes.call({ element }, url)

  test('the factory finds a source under every attribute setSource writes back', () => {
    for (const attribute of SOURCE_ATTRIBUTES) {
      const backgrounds = new VideoBackgrounds([])
      const element = document.createElement('div')
      element.setAttribute(attribute, 'https://example.com/clip.mp4')
      document.body.appendChild(element)

      backgrounds.add(element)
      expect(element.hasAttribute('data-vbg-uid')).toBe(true)

      writeBack(element, 'https://example.com/other.mp4')
      expect(element.getAttribute(attribute)).toBe('https://example.com/other.mp4')

      backgrounds.disconnect()
    }
  })

  // jsdom has no IntersectionObserver, so add() takes its always-play fallback
  test('the always-play fallback never writes into the params it was handed', () => {
    const backgrounds = new VideoBackgrounds([])
    const params = { muted: true }
    const element = document.createElement('div')
    element.setAttribute('data-vbg', 'https://example.com/clip.mp4')
    document.body.appendChild(element)

    backgrounds.add(element, params)

    expect(params).toEqual({ muted: true })
    backgrounds.disconnect()
  })

  test('an attribute the markup never carried is not invented', () => {
    const element = document.createElement('div')
    element.setAttribute('data-vbg', 'https://example.com/clip.mp4')

    writeBack(element, 'https://example.com/other.mp4')

    expect(element.hasAttribute('data-ytbg')).toBe(false)
    expect(element.hasAttribute('data-youtube')).toBe(false)
  })
})

describe('native loop and start-at', () => {
  const loopAttribute = (params) => {
    const player = document.createElement('video')
    VideoBackground.prototype.syncNativeLoop.call({ player, params })
    return player.hasAttribute('loop')
  }

  test('a loop with no start-at rides the seamless native attribute', () => {
    expect(loopAttribute({ loop: true, 'start-at': 0 })).toBe(true)
    expect(loopAttribute({ loop: false, 'start-at': 0 })).toBe(false)
  })

  test('start-at hands the loop to onVideoEnded, which native loop would skip', () => {
    expect(loopAttribute({ loop: true, 'start-at': 5 })).toBe(false)
  })

  test('a start-at set after the player exists still takes the attribute back', () => {
    const player = document.createElement('video')
    player.setAttribute('loop', '')
    const stub = Object.assign(Object.create(VideoBackground.prototype), {
      player,
      params: { loop: true, 'start-at': 0 }
    })

    stub.setStartAt(5)

    expect(stub.params['start-at']).toBe(5)
    expect(player.hasAttribute('loop')).toBe(false)
  })
})

describe('onVideoEnded', () => {
  const ended = (overrides) => {
    const calls = []
    const stub = {
      paused: false,
      params: { loop: true, 'start-at': 5 },
      updateState: () => {},
      dispatchEvent: () => {},
      seekTo: (seconds) => calls.push(`seek:${seconds}`),
      pause: () => calls.push('pause'),
      onVideoPlay: () => calls.push('announce'),
      ...overrides,
      player: { paused: true, play: () => calls.push('play'), ...overrides.player }
    }
    VideoBackground.prototype.onVideoEnded.call(stub)
    return calls
  }

  test('a looping video rewinds to start-at and plays again', () => {
    expect(ended({})).toEqual(['seek:5', 'play'])
  })

  test('an explicit user pause outlives the end of the video', () => {
    expect(ended({ paused: true })).toEqual(['pause'])
  })

  test('a loop cut short by end-at re-announces play without restarting', () => {
    // timeupdate reached end-at, so the element never actually stopped
    expect(ended({ player: { paused: false } })).toEqual(['seek:5', 'announce'])
  })

  test('a non-looping video stays stopped', () => {
    expect(ended({ params: { loop: false, 'start-at': 5 } })).toEqual(['pause'])
  })
})

describe('YouTube notstarted', () => {
  // YT fires state -1 on load, before anything has scrolled into view
  const notstarted = (overrides) => {
    const calls = []
    const stub = {
      STATES: { '-1': 'notstarted' },
      convertState: YoutubeBackground.prototype.convertState,
      params: { autoplay: true, 'always-play': false, 'start-at': 0 },
      isIntersecting: false,
      player: { playVideo: () => calls.push('play') },
      seekTo: () => {},
      onVideoPlay: () => {},
      onVideoPause: () => {},
      onVideoEnded: () => {},
      dispatchEvent: () => {},
      ...overrides
    }
    YoutubeBackground.prototype.onVideoStateChange.call(stub, { data: -1 })
    return calls
  }

  test('a lazy video never scrolled to stays quiet', () => {
    expect(notstarted({})).toEqual([])
  })

  test('an intersecting video starts, and always-play starts off-screen', () => {
    expect(notstarted({ isIntersecting: true })).toEqual(['play'])
    expect(notstarted({ params: { autoplay: true, 'always-play': true, 'start-at': 0 } })).toEqual(['play'])
  })

  test('autoplay off means off, wherever the video sits', () => {
    expect(notstarted({
      isIntersecting: true,
      params: { autoplay: false, 'always-play': true, 'start-at': 0 }
    })).toEqual([])
  })
})

describe('VideoBackgroundGroup wrap-around', () => {
  const step = (index) => {
    const events = []
    const stack = [document.createElement('div'), document.createElement('div')]
    const instance = { currentState: 'playing', play: () => {}, pause: () => {}, seek: () => {} }
    const stub = {
      current: 0,
      stack,
      videoBackgroundFactoryInstance: new Map(stack.map((element) => [element, instance])),
      getSeekBar: () => null,
      setProgress: () => {},
      levelSeekBars: () => {},
      dispatchEvent: (name) => events.push(name)
    }

    VideoBackgroundGroup.prototype.setCurrent.call(stub, index, true)
    return { events, current: stub.current }
  }

  test('running off the end wraps to the first and announces the rewind', () => {
    expect(step(2)).toEqual({ events: ['video-background-group-forward-rewind'], current: 0 })
  })

  test('running off the start wraps to the last and announces the rewind', () => {
    expect(step(-1)).toEqual({ events: ['video-background-group-backward-rewind'], current: 1 })
  })

  test('an ordinary step announces no rewind at all', () => {
    expect(step(1)).toEqual({ events: [], current: 1 })
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
