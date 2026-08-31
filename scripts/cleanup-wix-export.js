const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG buffer
const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAED5ptb3V0aA==', 'base64');

const cleanStyleAndScript = `
<style id="wix-custom-cleanup">
  /* 1. Remove Built on WIX Harmony top banner */
  #WIX_ADS, .WIX_ADS, [data-testid="wix-ads"], [class*="WixAds"], [id*="WixAds"], [class*="wixAds"], [id*="wixAds"], [class*="harmony"], [id*="harmony"], #WIX_ADS_CONTAINER, div[class*="banner"], a[href*="wix.com"] {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  :root {
    --wix-ads-height: 0px !important;
    --sticky-offset: 0px !important;
    --wix-ads-top-height: 0px !important;
  }
  /* 2. Remove AI Foundry logo badge */
  img[src*="ChatGPT%20Image"], img[src*="ChatGPT"], [data-image-info*="ChatGPT"], [data-image-info*="ChatGPT%20Image"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
  }
</style>
<script id="parent-nav-bridge">
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A' && el !== document.body) {
      el = el.parentElement;
    }
    if (el && el.tagName === 'A') {
      var text = (el.textContent || '').trim().toUpperCase();
      var href = (el.getAttribute('href') || '').toLowerCase();
      
      if (text === 'HOME' || href.endsWith('/my-site-1') || href.endsWith('/my-site-1/')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.location.href = '/';
        }
      } else if (text === 'EVENTS' || href.includes('events')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.location.href = '/events';
        }
      } else if (text === 'GALLERY' || href.includes('gallery')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.location.href = '/gallery';
        }
      } else if (text === 'TEAM' || href.includes('team') || href.includes('contact')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.parent && window.parent !== window) {
          window.parent.location.href = '/team';
        }
      }
    }
  }, true);
</script>
`;

const dirs = ['landing', 'events', 'gallery', 'team', 'landing page', 'EVENTS page', 'gallery page', 'team page'];
dirs.forEach(d => {
  const htmlPath = path.join('public', 'wix-export', d, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    // Clean any prior script/style
    content = content.replace(/<style id="wix-custom-cleanup">[\s\S]*?<\/script>/g, '');
    content = content.replace('<head>', '<head>' + cleanStyleAndScript);
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('Injected cleanStyleAndScript into:', htmlPath);
  }

  // Replace ChatGPT logo image
  const imgDir = path.join('public', 'wix-export', d, 'images');
  if (fs.existsSync(imgDir)) {
    fs.readdirSync(imgDir).forEach(file => {
      if (file.toLowerCase().includes('chatgpt')) {
        fs.writeFileSync(path.join(imgDir, file), transparentPng);
        console.log('Zeroed out logo badge image:', path.join(imgDir, file));
      }
    });
  }
});
console.log('Wix cleanup script completed.');
