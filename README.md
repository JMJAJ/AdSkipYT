# YouTube Ad Detector with Auto-Skip

## Current State - Updated on 17/9/2024

- <s>It works but yt breaks it sometimes, like it works 1 week and then 2 days in row its broken tho mostly its broken for  just few hours or few vids</s> I updated the code and optimized it so lets see

## Overview

This Tampermonkey script detects ads on YouTube and automatically skips them. When an ad is detected, a red banner is displayed at the top of the screen, primarily for debugging purposes. The script also removes various main page ads and promotional content on YouTube.

## Features

- **Ad Detection:** Identifies when an ad is being played on YouTube.
- **Auto-Skip:** Automatically skips the detected ad when possible.
- **Visual Indicator:** Displays a red banner when an ad is detected (mainly for debugging).
- **Ad Content Removal:** 
  - Removes promotional content under videos
  - Removes ads from the YouTube main page
- **Anti-Adblock Detection:** Attempts to bypass YouTube's ad blocker detection by refreshing the page.

## Installation

1. **Install Tampermonkey:** If you haven't already, install the Tampermonkey extension for your browser from [the official website](https://www.tampermonkey.net/).
2. **Add the Script:** Click on the Tampermonkey extension icon and select "Create a new script...". Copy and paste the latest version of the script into the editor and save.

## Usage

Once installed, the script will run automatically on YouTube pages. You should notice:

- Ads being skipped more quickly
- A red banner appearing briefly when ads are detected (if not immediately skipped)
- Fewer promotional elements on the YouTube main page and under videos

## Known Issues and Limitations

- The effectiveness of the script may vary as YouTube frequently updates its ad delivery system and anti-adblock measures.
- In some cases, YouTube may still detect the use of this script, potentially leading to warnings or reduced functionality.
- The page refresh feature (to bypass adblock detection) may cause a slightly disruptive viewing experience.

## Troubleshooting

If you encounter issues with the script:

1. Ensure you're using the latest version of the script.
2. Try disabling and re-enabling the script in Tampermonkey.
3. Clear your browser cache and cookies for YouTube.
4. If problems persist, consider temporarily disabling the script and checking for updates or community discussions about recent YouTube changes.

## Disclaimer

This script is for educational purposes only. Be aware that its use may violate YouTube's terms of service. Use at your own risk.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Script

```javascript
// ==UserScript==
// @name         YouTube Ad Skipper (Enhanced with Anti-Adblock) - Optimized
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Skip ads on YouTube automatically, with improved performance and advanced anti-adblock measures
// @author       Jxint
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        checkInterval: 250, // Increased from 100ms to reduce CPU usage
        adBannerColor: 'red',
        adBannerText: 'Ad is being played!',
        debug: false,
        refreshDelay: 3000,
        maxRefreshCount: 3,
    };

    let adBanner;
    let lastCheckTime = 0;
    let refreshCount = 0;
    let lastRefreshTime = 0;

    const adSelectors = {
        video: '.ytp-ad-player-overlay-layout, .ytp-ad-text, .ytp-ad-skip-button-container',
        mainPage: `
            ytd-display-ad-renderer,
            ytd-promoted-sparkles-web-renderer,
            ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
            ytd-badge-supported-renderer,
            ytd-ad-slot-renderer,
            #player-ads,
            #masthead-ad,
            .ytd-promoted-video-renderer
        `
    };

    function createAdBanner() {
        if (adBanner) return;

        adBanner = document.createElement('div');
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
        adBanner.textContent = config.adBannerText;
        document.body.appendChild(adBanner);
    }

    function log(message) {
        if (config.debug) {
            console.log(`[YouTube Ad Skipper] ${message}`);
        }
    }

    function checkForAds() {
        const now = performance.now();
        if (now - lastCheckTime < config.checkInterval) return;
        lastCheckTime = now;

        const adElement = document.querySelector(adSelectors.video);

        if (adElement) {
            if (!adBanner) createAdBanner();
            adBanner.style.display = 'block';
            autoSkipAd();
        } else if (adBanner) {
            adBanner.style.display = 'none';
        }

        checkForAdblockDetection();
    }

    function autoSkipAd() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 100);
            log(`Video time set to ${videoElement.currentTime}`);
        }

        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-container button, .ytp-ad-skip-button-text');
        if (skipButton) {
            skipButton.click();
            log('Ad skipped');
        }
    }

    function checkForAdblockDetection() {
        const adblockDetectionElement = document.getElementById('container');
        if (adblockDetectionElement?.querySelector('ytd-enforcement-message-view-model')?.textContent.toLowerCase().includes('ad blocker')) {
            log('Adblock detection message found');
            refreshPage();
        }
    }

    function refreshPage() {
        const now = performance.now();
        if (now - lastRefreshTime < config.refreshDelay) return;

        if (refreshCount < config.maxRefreshCount) {
            refreshCount++;
            lastRefreshTime = now;
            log(`Refreshing page (attempt ${refreshCount})`);
            setTimeout(() => window.location.reload(), config.refreshDelay);
        } else {
            log(`Max refresh attempts (${config.maxRefreshCount}) reached. Please check manually.`);
        }
    }

    function removeMainPageAds() {
        const removedAds = document.querySelectorAll(adSelectors.mainPage);
        removedAds.forEach(ad => ad.remove());
        if (removedAds.length > 0) {
            log(`Removed ${removedAds.length} main page ad elements`);
        }
    }

    function initMutationObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldCheck = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' ||
                    (mutation.type === 'attributes' && ['class', 'src'].includes(mutation.attributeName))) {
                    shouldCheck = true;
                    break;
                }
            }
            if (shouldCheck) {
                checkForAds();
                removeMainPageAds();
            }
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
    }

    // Start the script
    init();
})();
```
