
// Initialize PWA functionality
function initPWA(pageType) {
    console.log('PWA initialization started for:', pageType);
    
    // Register service worker with absolute path
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
    
    // Force orientation unlock for PWA
    if (screen && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock().catch(e => {
            console.log('Orientation unlock not supported or failed:', e);
        });
    }
    
    // Handle install prompt only on landing page
    if (pageType === 'landing') {
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');
        const installPromptBtn = document.getElementById('installPromptBtn');
        const dismissBtn = document.getElementById('dismissBtn');
        const notification = document.getElementById('notification');
        
        console.log('Setting up install prompt handlers...');
        
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            if (installBtn) {
                installBtn.style.display = 'inline-flex';
                console.log('Install button shown');
            }
            
            // Show notification after 5 seconds
            setTimeout(() => {
                if (notification && !window.matchMedia('(display-mode: standalone)').matches) {
                    notification.style.display = 'flex';
                    console.log('Install notification shown');
                }
            }, 5000);
        });
        
        // Check if app is already installed
        window.addEventListener('load', () => {
            if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('App is running in standalone mode');
                if (installBtn) installBtn.style.display = 'none';
                if (notification) notification.style.display = 'none';
            }
        });
        
        // Button click handlers
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                console.log('Install button clicked');
                showInstallPrompt();
            });
        }
        
        if (installPromptBtn) {
            installPromptBtn.addEventListener('click', () => {
                console.log('Install prompt button clicked');
                showInstallPrompt();
                if (notification) notification.style.display = 'none';
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                console.log('Dismiss button clicked');
                if (notification) notification.style.display = 'none';
            });
        }
        
        function showInstallPrompt() {
            console.log('Showing install prompt, deferredPrompt:', deferredPrompt);
            if (deferredPrompt) {
                deferredPrompt.prompt();
                
                deferredPrompt.userChoice.then((choiceResult) => {
                    console.log('User choice:', choiceResult.outcome);
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    
                    deferredPrompt = null;
                    if (installBtn) installBtn.style.display = 'none';
                });
            } else {
                console.log('No deferred prompt available');
                // Fallback: show manual installation instructions
                alert('Please use your browser\'s menu to install this app. Look for "Install App" or "Add to Home Screen" option.');
            }
        }
        
        // Track if the app is successfully installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed successfully');
            if (installBtn) installBtn.style.display = 'none';
            if (notification) notification.style.display = 'none';
        });
        
        // Debug: Check if PWA criteria are met
        console.log('PWA Debug Info:');
        console.log('- Service Worker supported:', 'serviceWorker' in navigator);
        console.log('- Manifest link present:', !!document.querySelector('link[rel="manifest"]'));
        console.log('- HTTPS or localhost:', location.protocol === 'https:' || location.hostname === 'localhost');
    }
}
