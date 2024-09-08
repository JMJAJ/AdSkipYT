# Current State - update on 10/7/2024
 - So in last 3 days, it works now fine last 24 hours but didnt work between 7/7/2024 to 8/7/2024. Im genuinely confused xd
 - As of now, it works sometimes but yt can detect it. I will try to fix it (7/7/2024)

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
// @name         YouTube Ad Skipper (Enhanced)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Skip ads on YouTube automatically with improved performance and features
// @author       Jxint (improved by Claude)
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        checkInterval: 100,
        adBannerColor: 'red',
        adBannerText: 'Ad is being played!',
        debug: false
    };

    const adBanner = createAdBanner();
    let lastCheckTime = 0;

    function createAdBanner() {
        const adBanner = document.createElement('div');
        adBanner.id = 'ad-banner';
        adBanner.style.cssText = `
            position: fixed;
            top: 0;
            width: 100%;
            background-color: ${config.adBannerColor};
            color: white;
            text-align: center;
            padding: 10px;
            z-index: 10000;
            display: none;
            font-weight: bold;
            font-family: Arial, sans-serif;
        `;
        adBanner.innerText = config.adBannerText;
        document.body.appendChild(adBanner);
        return adBanner;
    }

    function log(message) {
        if (config.debug) {
            console.log(`[YouTube Ad Skipper] ${message}`);
        }
    }

    function checkForAds() {
        const now = Date.now();
        if (now - lastCheckTime < config.checkInterval) return;
        lastCheckTime = now;

        const adSelectors = '.ytp-ad-player-overlay-layout, .ytp-ad-text, .ytp-ad-skip-button-container';
        const adElement = document.querySelector(adSelectors);

        if (adElement) {
            adBanner.style.display = 'block';
            autoSkipAd();
        } else {
            adBanner.style.display = 'none';
        }
    }

    function autoSkipAd() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            const newTime = Math.min(videoElement.duration, videoElement.currentTime + 100);
            videoElement.currentTime = newTime;
            log(`Video time set to ${newTime}`);
        }

        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-container button, .ytp-ad-skip-button-text');
        if (skipButton) {
            skipButton.click();
            log('Ad skipped');
        }
    }

    function removeMainPageAds() {
        const adSelectors = `
            ytd-display-ad-renderer,
            ytd-promoted-sparkles-web-renderer,
            ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
            ytd-badge-supported-renderer,
            ytd-ad-slot-renderer,
            #player-ads,
            #masthead-ad,
            .ytd-promoted-video-renderer
        `;
        const removedAds = document.querySelectorAll(adSelectors);
        removedAds.forEach(ad => ad.remove());
        if (removedAds.length > 0) {
            log(`Removed ${removedAds.length} main page ad elements`);
        }
    }

    function initMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' ||
                    (mutation.type === 'attributes' &&
                     ['class', 'src'].includes(mutation.attributeName))) {
                    checkForAds();
                    removeMainPageAds();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'src'],
        });

        log('Mutation observer initialized');
    }

    function init() {
        log('Initializing YouTube Ad Skipper');
        checkForAds();
        removeMainPageAds();
        initMutationObserver();
        setInterval(removeMainPageAds, config.checkInterval);
    }

    // Start the script
    init();
})();
```
