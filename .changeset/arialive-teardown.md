---
"yugen-ui": patch
---

AriaLive: the fallback announcer (used when there is no `AriaLiveAnnouncer`) no longer throws "window is not defined" when its queued timers fire after the window is gone, for example after a test environment is torn down.
