## Idea #1
```javascript
// ==UserScript==
// @name         YouTube Ad Fast-Forward
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make YouTube ads play 1000x faster
// @author       Jxint
// @match        *://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function checkForAd() {
        const video = document.querySelector('video');
        const adIndicator = document.querySelector('.ad-showing'); // Detects if an ad is being shown

        if (video && adIndicator) {
            video.playbackRate = 50; // Speed up the video by 1000x
        } else if (video) {
            video.playbackRate = 1; // Reset the playback rate to normal when not an ad
        }
    }

    // Observe changes in the DOM to check for ads
    const observer = new MutationObserver(() => {
        checkForAd();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    checkForAd();
})();

```
