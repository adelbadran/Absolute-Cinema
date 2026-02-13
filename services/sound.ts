
// Simple Haptic Service for mobile feel
class SoundService {
    // Vibrate patterns
    vibrateClick() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Very short tick
        }
    }

    vibrateSuccess() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]); 
        }
    }

    vibrateError() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 50, 30, 50, 100]); 
        }
    }

    vibrateTurn() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(500); 
        }
    }
}

export const sounds = new SoundService();
