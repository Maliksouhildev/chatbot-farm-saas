export class SoundManager {
  private static audioElements: Record<string, HTMLAudioElement> = {};
  private static isMuted = false;
  private static volume = 1.0;

  static initialize() {
    if (typeof window === 'undefined') return;
    
    // Load saved settings
    const settings = localStorage.getItem('cf_sound_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.isMuted = !!parsed.isMuted;
        this.volume = parsed.volume !== undefined ? parsed.volume : 1.0;
      } catch (e) {}
    }
  }

  static getAudio(appId: string): HTMLAudioElement {
    if (!this.audioElements[appId]) {
      // Map common apps to their specific placeholder files
      let filename = appId;
      if (appId === 'whatsapp_2') filename = 'whatsapp';
      
      const audio = new Audio(`/sounds/${filename}.mp3`);
      this.audioElements[appId] = audio;
    }
    return this.audioElements[appId];
  }

  static play(appId: string) {
    if (this.isMuted) return;
    
    // Load app-specific override settings
    const overrides = localStorage.getItem('cf_sound_overrides');
    if (overrides) {
      try {
        const parsed = JSON.parse(overrides);
        if (parsed[appId] === false) return; // Muted for this specific app
      } catch (e) {}
    }

    try {
      const audio = this.getAudio(appId);
      audio.volume = this.volume;
      audio.currentTime = 0;
      // We catch the error because browsers block autoplay until user interacts
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("SoundManager play failed:", err);
    }
  }

  static setMuted(muted: boolean) {
    this.isMuted = muted;
    this.saveSettings();
  }

  static setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  static getSettings() {
    return { isMuted: this.isMuted, volume: this.volume };
  }

  static isAppSoundEnabled(appId: string): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const overrides = localStorage.getItem('cf_sound_overrides');
      if (overrides) {
        const parsed = JSON.parse(overrides);
        if (parsed[appId] === false) return false;
      }
    } catch {}
    return true;
  }

  static setAppSoundEnabled(appId: string, enabled: boolean) {
    if (typeof window === 'undefined') return;
    try {
      const overrides = localStorage.getItem('cf_sound_overrides');
      const parsed = overrides ? JSON.parse(overrides) : {};
      parsed[appId] = enabled;
      localStorage.setItem('cf_sound_overrides', JSON.stringify(parsed));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('app_sound_changed', { detail: { appId, enabled } }));
    } catch {}
  }

  private static saveSettings() {
    localStorage.setItem('cf_sound_settings', JSON.stringify({
      isMuted: this.isMuted,
      volume: this.volume
    }));
  }
}
