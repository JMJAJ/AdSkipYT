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
        // there was more before tho it wasnt needed
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
        const ads = document.querySelectorAll('ytd-display-ad-renderer, ytd-promoted-sparkles-web-renderer', 'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)');
        ads.forEach(ad => ad.remove());
    }

    function enablePiP() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.requestPictureInPicture().catch(error => {
                console.error('Failed to enable PiP mode:', error);
            });
        } else {
            console.error('No video element found');
        }
    }

    function autoSkipAd() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
            enablePiP();
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
