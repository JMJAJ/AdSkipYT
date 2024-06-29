# YouTube Ad Detector with Auto-Skip

## Overview

This Tampermonkey script detects ads on YouTube and automatically skips them. When an ad is detected, a red banner is displayed at the top of the screen indicating that an ad is being played (mainly used for debugging). The script also removes various main page ads on YouTube.

## Features

- **Ad Detection:** Identifies when an ad is being played on YouTube.
- **Auto-Skip:** Automatically skips the detected ad.
- **Ad Banner:** Displays a banner when an ad is detected.
- **Main Page Ad Removal:** Removes promotional content from the YouTube main page.

## Installation

1. **Install Tampermonkey:** If you haven't already, install Tampermonkey for your browser from [here](https://www.tampermonkey.net/).
2. **Add the Script:** Click on the Tampermonkey extension icon and select "Create a new script...". Copy and paste the code below into the editor and save.

## Script

```javascript
// ==UserScript==
// @name         YouTube Ad Detector with Auto-Skip
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Detect if an ad is being played on YouTube and auto-skip
// @author       Jxint
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const adSelectors = [
        '.ytp-ad-player-overlay-layout', // Overlay layout for ads
    ];

    const adBanner = document.createElement('div');
    adBanner.id = 'ad-banner';
    adBanner.style.position = 'fixed';
    adBanner.style.top = '0';
    adBanner.style.width = '100%';
    adBanner.style.backgroundColor = 'red';
    adBanner.style.color = 'white';
    adBanner.style.textAlign = 'center';
    adBanner.style.padding = '10px';
    adBanner.style.zIndex = '10000';
    adBanner.style.display = 'none';
    adBanner.innerText = 'Ad is being played!';
    document.body.appendChild(adBanner);

    function showAdBanner() {
        adBanner.style.display = 'block';
    }

    function hideAdBanner() {
        adBanner.style.display = 'none';
    }

    function checkForAds() {
        let adDetected = false;
        adSelectors.forEach(selector => {
            if (document.querySelector(selector)) {
                console.log('Ad detected:', selector);
                adDetected = true;
            }
        });
        if (adDetected) {
            showAdBanner();
            autoSkipAd();
        } else {
            hideAdBanner();
        }
    }

    function removeMainPageAds() {
        const ads = document.querySelectorAll('ytd-display-ad-renderer, ytd-promoted-sparkles-web-renderer, ytd-rich-item-renderer:has(ytd-ad-slot-renderer)');
        ads.forEach(ad => ad.remove());
    }

    function autoSkipAd() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
        } else {
            console.error('No video element found');
        }
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            checkForAds();
            removeMainPageAds();
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    checkForAds();
    removeMainPageAds();
})();
```

## Usage
 - Install the script via Tampermonkey.
 - Visit YouTube and watch videos as usual. The script will automatically detect and skip ads kek.

## Contributing
 - This time I actually welcome some ideas
