# YouTube Ad Detector with Auto-Skip

## Current State - Updated on 10/7/2024

- As of the last 24 hours (9/7/2024 - 10/7/2024), the script is functioning properly.
- Between 7/7/2024 and 8/7/2024, the script experienced some issues and was not working as expected.
- On 7/7/2024, it was noted that the script worked intermittently, but YouTube could detect it at times.
- The functionality of the script may fluctuate due to ongoing changes in YouTube's ad delivery and detection systems.

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
// @name         YouTube Ad Skipper (Enhanced with Auto-Refresh)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Skip ads on YouTube automatically, with improved performance and auto-refresh for adblock detection
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
        debug: false,
        refreshDelay: 3000, // Delay before refreshing (in milliseconds)
        maxRefreshCount: 3, // Maximum number of consecutive refreshes
    };

    const adBanner = createAdBanner();
    let lastCheckTime = 0;
    let refreshCount = 0;
    let lastRefreshTime = 0;

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

        checkForAdblockDetection();
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

    function checkForAdblockDetection() {
        const adblockDetectionSelectors = [
            'ytd-enforcement-message-view-model',
            '.ytd-player-error-message-renderer',
            '#error-screen',
            '.ytp-error'
        ];

        const adblockDetected = adblockDetectionSelectors.some(selector =>
            document.querySelector(selector)?.textContent.toLowerCase().includes('ad blocker')
        );

        if (adblockDetected) {
            log('Adblock detection message found');
            refreshPage();
        } else {
            refreshCount = 0;
        }
    }

    function refreshPage() {
        const now = Date.now();
        if (now - lastRefreshTime < config.refreshDelay) return;

        if (refreshCount < config.maxRefreshCount) {
            refreshCount++;
            lastRefreshTime = now;
            log(`Refreshing page (attempt ${refreshCount})`);
            setTimeout(() => {
                window.location.reload();
            }, config.refreshDelay);
        } else {
            log(`Max refresh attempts (${config.maxRefreshCount}) reached. Please check manually.`);
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
