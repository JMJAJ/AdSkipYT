# As of now, it works sometimes. I will try to fix it

# YouTube Ad Detector with Auto-Skip

## Overview

This Tampermonkey script detects ads on YouTube and automatically skips them. When an ad is detected, a red banner is displayed at the top of the screen indicating that an ad is being played (mainly used for debugging). The script also removes various main page ads on YouTube.

## Features

- **Ad Detection:** Identifies when an ad is being played on YouTube.
- **Auto-Skip:** Automatically skips the detected ad.
- **Red Ad Banner:** Displays a banner when an ad is detected.
- **Ad Banner Under Video** Removes promotional content under the video
- **Main Page Ad Removal:** Removes promotional content from the YouTube main page.

## Installation

1. **Install Tampermonkey:** If you haven't already, install Tampermonkey for your browser from [here](https://www.tampermonkey.net/).
2. **Add the Script:** Click on the Tampermonkey extension icon and select "Create a new script...". Copy and paste the code below into the editor and save.

## Script

```javascript
// ==UserScript==
// @name         YouTube Ad Skipper
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Skip ads on YouTube automatically
// @author       Jxint
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let adDetected = false;
    const adBanner = createAdBanner();

    function createAdBanner() {
        const adBanner = document.createElement('div');
        adBanner.id = 'ad-banner';
        adBanner.style.cssText = 'position: fixed; top: 0; width: 100%; background-color: red; color: white; text-align: center; padding: 10px; z-index: 10000; display: none;';
        adBanner.innerText = 'Ad is being played!';
        document.body.appendChild(adBanner);
        return adBanner;
    }

    function checkForAds() {
        const adSelectors = [
            '.ytp-ad-player-overlay-layout',
        ];

        adDetected = adSelectors.some(selector => document.querySelector(selector));
        if (adDetected) {
            showAdBanner();
            autoSkipAd();
        } else {
            hideAdBanner();
        }
    }

    function showAdBanner() {
        adBanner.style.display = 'block';
    }

    function hideAdBanner() {
        adBanner.style.display = 'none';
    }

    function autoSkipAd() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
        } else {
            console.error('No video element found');
        }

        const skipButton = document.querySelector('.ytp-ad-skip-button-text');
        if (skipButton) {
            skipButton.click();
        } else {
            console.error('No skip button found');
        }
    }

    function removeMainPageAds() {
        const ads = document.querySelectorAll('ytd-display-ad-renderer, ytd-promoted-sparkles-web-renderer, ytd-rich-item-renderer:has(ytd-ad-slot-renderer), ytd-badge-supported-renderer, #player-ads, #masthead-ad');
        ads.forEach(ad => ad.remove());
    }

    function handleMutations(mutationsList) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                checkForAds();
                removeMainPageAds();
            }
        });
    }

    const observer = new MutationObserver(handleMutations);

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'src'],
    });

    checkForAds();
    removeMainPageAds();
})();
```
