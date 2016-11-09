let context: AudioContext;
export function getAudioContext(): AudioContext {
  if (context === undefined) {
    // !!!TODO: context = new (window.AudioContext || window.webkitAudioContext)();
    context = new AudioContext();
  }
  return context;
}
