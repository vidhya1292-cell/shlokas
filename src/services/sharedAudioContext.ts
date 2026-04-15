/**
 * Tiny shared store for the Web Audio API AudioContext.
 * Avoids circular imports between sarvamService and chantingService.
 * sarvamService calls setSharedAudioContext when it creates/resumes the context.
 * chantingService reads it to connect HTMLAudio through a GainNode for volume boost.
 */

let _ctx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  return _ctx;
}

export function setSharedAudioContext(ctx: AudioContext): void {
  _ctx = ctx;
}
