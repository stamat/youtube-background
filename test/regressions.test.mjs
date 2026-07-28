import test from 'node:test';
import assert from 'node:assert/strict';

import { VideoBackgrounds } from '../src/video-backgrounds.js';
import { VideoBackground, MIME_MAP, RE_VIDEO_FILE } from '../src/lib/video-background.js';
import { SuperVideoBackground } from '../src/lib/super-video-background.js';

// These methods never touch `this` beyond plain data, so they can be exercised
// off the prototype with a stub receiver - no DOM, no player APIs, no test framework.
const getVidID = (link) => VideoBackgrounds.prototype.getVidID.call(null, link);
const parseProperties = (...args) => SuperVideoBackground.prototype.parseProperties.call(null, ...args);
const setMimeType = (source) => {
  const stub = { MIME_MAP };
  VideoBackground.prototype.setMimeType.call(stub, source);
  return stub;
};

test('getVidID returns undefined instead of throwing on a missing link', () => {
  assert.equal(getVidID(null), undefined);
  assert.equal(getVidID(undefined), undefined);
  assert.equal(getVidID(''), undefined);
});

test('getVidID identifies each supported source type', () => {
  assert.equal(getVidID('https://youtu.be/dQw4w9WgXcQ').type, 'YOUTUBE');
  assert.equal(getVidID('https://www.youtube.com/watch?v=dQw4w9WgXcQ').id, 'dQw4w9WgXcQ');
  assert.equal(getVidID('https://vimeo.com/123456789').type, 'VIMEO');
  assert.equal(getVidID('https://example.com/clip.mp4').type, 'VIDEO');
});

test('getVidID picks up the Vimeo unlisted hash', () => {
  assert.equal(getVidID('https://vimeo.com/123456789/abc123def').unlisted, 'abc123def');
  assert.equal(getVidID('https://vimeo.com/123456789?h=abc123def').unlisted, 'abc123def');
});

test('getVidID matches every container MIME_MAP claims to support', () => {
  for (const ext in MIME_MAP) {
    const data = getVidID(`https://example.com/media/clip.${ext}`);
    assert.equal(data && data.type, 'VIDEO', `.${ext} should be detected as a video file`);
    assert.equal(data.id, `clip.${ext}`);
  }
});

test('RE_VIDEO_FILE tolerates query strings and hashes, and ignores unknown containers', () => {
  assert.equal('https://example.com/clip.mp4?v=2'.match(RE_VIDEO_FILE)[1], 'clip.mp4');
  assert.equal('https://example.com/clip.webm#t=10'.match(RE_VIDEO_FILE)[1], 'clip.webm');
  assert.equal('https://example.com/clip.MP4'.match(RE_VIDEO_FILE)[1], 'clip.MP4');
  assert.equal('https://example.com/clip.mkv'.match(RE_VIDEO_FILE), null);
  assert.equal('https://example.com/no-extension'.match(RE_VIDEO_FILE), null);
});

test('setMimeType leaves the MIME undefined rather than throwing on a bare filename', () => {
  assert.equal(setMimeType('no-extension').mime, undefined);
  assert.equal(setMimeType('clip.mkv').mime, undefined);
  assert.equal(setMimeType('clip.MOV').mime, 'video/quicktime');
  assert.equal(setMimeType('clip.mp4').mime, 'video/mp4');
});

test('parseProperties falls back to defaults and honours overrides', () => {
  const defaults = { muted: true, loop: true, 'start-at': 0 };

  assert.deepEqual(parseProperties(null, defaults, null, 'data-vbg-'), defaults);
  assert.equal(parseProperties({ muted: false }, defaults, null, 'data-vbg-').muted, false);
  // a key absent from the passed params still gets its default
  assert.equal(parseProperties({ muted: false }, defaults, null, 'data-vbg-').loop, true);
});

test('parseProperties reads data attributes under either prefix and coerces types', () => {
  const defaults = { muted: true, loop: true, 'start-at': 0 };
  const attributes = { 'data-vbg-muted': 'false', 'data-ytbg-start-at': '12' };
  const element = { getAttribute: (name) => (name in attributes ? attributes[name] : null) };

  const params = parseProperties(null, defaults, element, ['data-ytbg-', 'data-vbg-']);
  assert.equal(params.muted, false);
  assert.equal(params['start-at'], 12);
  assert.equal(params.loop, true);
});

test('timeToPercentage and percentageToTime round-trip around start-at', () => {
  const instance = { params: { 'start-at': 10 }, duration: 110 };
  const toPercentage = (t) => SuperVideoBackground.prototype.timeToPercentage.call(instance, t);
  const toTime = (p) => SuperVideoBackground.prototype.percentageToTime.call(instance, p);

  assert.equal(toPercentage(50), 40);
  assert.equal(toTime(40), 50);

  // clamped at both ends
  assert.equal(toPercentage(5), 0);
  assert.equal(toPercentage(999), 100);
  assert.equal(toTime(-1), 10);
  assert.equal(toTime(101), 110);
});

test('percentageToTime returns start-at while the duration is still unknown', () => {
  const instance = { params: { 'start-at': 7 }, duration: 0 };
  assert.equal(SuperVideoBackground.prototype.percentageToTime.call(instance, 50), 7);
});

test('shouldPlay never overrides an explicit user pause', () => {
  const shouldPlay = (state) => SuperVideoBackground.prototype.shouldPlay.call(state);

  const playable = {
    paused: false,
    currentState: 'paused',
    isIntersecting: true,
    params: { loop: true, autoplay: true, 'always-play': false }
  };

  assert.equal(shouldPlay(playable), true);
  assert.equal(shouldPlay({ ...playable, paused: true }), false);
  assert.equal(shouldPlay({ ...playable, currentState: 'playing' }), false);
  assert.equal(shouldPlay({ ...playable, isIntersecting: false }), false);

  // out of view but pinned with always-play
  assert.equal(shouldPlay({
    ...playable,
    isIntersecting: false,
    params: { ...playable.params, 'always-play': true }
  }), true);

  // finished and not looping
  assert.equal(shouldPlay({
    ...playable,
    currentState: 'ended',
    params: { ...playable.params, loop: false }
  }), false);
});
