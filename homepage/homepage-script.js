
// Homepage specific JavaScript functionality
import { PlatformSelector } from '../src/components/PlatformSelector.js';
import { MarrowSubjectList } from '../src/platforms/marrow/MarrowSubjectList.js';
import { DamsSubjectList } from '../src/platforms/dams/DamsSubjectList.js';
import { PrepladderSubjectList } from '../src/platforms/prepladder/PrepladderSubjectList.js';
import { SearchPage } from '../src/search/SearchPage.js';
import { HomePage } from '../src/home/HomePage.js';

class HomepageApp {
  constructor() {
    this.platformSelector = new PlatformSelector();
    this.marrowSubjectList = new MarrowSubjectList();
    this.damsSubjectList = new DamsSubjectList();
    this.prepladderSubjectList = new PrepladderSubjectList();
    this.searchPage = new SearchPage();
    this.homePage = new HomePage();
    this.selectedPlatform = null;
    this.selectedSubject = null;
    this.currentView = 'home';

    this.init();
  }

  init() {
    // Enhanced PWA functionality
    this.registerServiceWorker();
    this.handleInstallPrompt();
    this.setupEventListeners();
    this.updateView();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  handleInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install prompt if needed
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallBanner();
    });
  }

  showInstallBanner() {
    // Create a subtle install banner for returning users
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #4f46e5, #06b6d4);
        color: white;
        padding: 10px 20px;
        text-align: center;
        z-index: 1000;
        font-size: 0.9rem;
      ">
        📱 Install NEXTPULSE app for better experience
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          margin-left: 10px;
          cursor: pointer;
          font-size: 1.2rem;
        ">×</button>
      </div>
    `;
    
    document.body.prepend(banner);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      const bannerEl = document.getElementById('install-banner');
      if (bannerEl) bannerEl.remove();
    }, 10000);
  }

  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.remove();
  }

  setupEventListeners() {
    document.addEventListener('platformSelect', (e) => {
      this.selectedPlatform = e.detail;
      this.currentView = 'subjects';
      this.updateView();
    });

    document.addEventListener('subjectSelect', (e) => {
      this.selectedSubject = e.detail.subject;
      this.currentView = 'lectures';
      this.updateView();
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBack());
    }

    // Enhanced navigation handling
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
      bottomNav.addEventListener('click', (e) => {
        const navItem = e.target.closest('a');
        if (!navItem) return;

        e.preventDefault();
        const navItems = bottomNav.querySelectorAll('a');
        navItems.forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        const navText = navItem.querySelector('span').textContent;
        switch(navText) {
          case 'Home':
            this.currentView = 'home';
            break;
          case 'Videos':
            this.currentView = 'platforms';
            break;
          case 'Search':
            this.currentView = 'search';
            break;
          case 'Q Bank':
            window.location.href = 'quiz/index.html';
            return;
        }
        this.updateView();
      });
    }

    // Add offline detection
    window.addEventListener('online', () => {
      this.showNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
      this.showNetworkStatus('offline');
    });
  }

  showNetworkStatus(status) {
    const statusBar = document.createElement('div');
    statusBar.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 25px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      transition: all 0.3s ease;
      ${status === 'online' 
        ? 'background: #10b981;' 
        : 'background: #ef4444;'
      }
    `;
    statusBar.textContent = status === 'online' ? '🟢 Back Online' : '🔴 Offline Mode';
    
    document.body.appendChild(statusBar);
    
    setTimeout(() => {
      statusBar.remove();
    }, 3000);
  }

  handleBack() {
    if (this.currentView === 'lectures') {
      this.currentView = 'subjects';
      this.selectedSubject = null;
    } else if (this.currentView === 'subjects') {
      this.currentView = 'platforms';
      this.selectedPlatform = null;
    }
    this.updateView();
  }

  handleSearch(query) {
    query = query.toLowerCase();
    
    if (this.currentView === 'lectures') {
      const lectureCards = document.querySelectorAll('.lecture-card');
      lectureCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'flex' : 'none';
      });
    } else if (this.currentView === 'subjects') {
      const subjectCards = document.querySelectorAll('.subject-card');
      subjectCards.forEach(card => {
        const subject = card.textContent.toLowerCase();
        card.style.display = subject.includes(query) ? 'block' : 'none';
      });
    } else {
      const platformButtons = document.querySelectorAll('.platform-selector button');
      platformButtons.forEach(button => {
        const platform = button.textContent.toLowerCase();
        button.style.display = platform.includes(query) ? 'flex' : 'none';
      });
    }
  }

  async updateView() {
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = '';
    
    const pageTitle = document.getElementById('pageTitle');
    const backBtn = document.getElementById('backBtn');
    
    if (this.currentView === 'home') {
      if (pageTitle) pageTitle.textContent = 'NEXTPULSE';
      if (backBtn) backBtn.style.display = 'none';
      main.appendChild(await this.homePage.render());
    } else if (this.currentView === 'search') {
      if (pageTitle) pageTitle.textContent = 'Search';
      if (backBtn) backBtn.style.display = 'none';
      main.appendChild(this.searchPage.render());
    } else if (this.currentView === 'platforms') {
      if (pageTitle) pageTitle.textContent = 'Select Platform';
      if (backBtn) backBtn.style.display = 'none';
      main.appendChild(this.platformSelector.render());
    } else if (this.currentView === 'subjects') {
      if (pageTitle) pageTitle.textContent = `${this.selectedPlatform.toUpperCase()} Subjects`;
      if (backBtn) backBtn.style.display = 'block';
      
      let subjectList;
      switch(this.selectedPlatform) {
        case 'marrow':
          subjectList = this.marrowSubjectList;
          break;
        case 'dams':
          subjectList = this.damsSubjectList;
          break;
        case 'prepladder':
          subjectList = this.prepladderSubjectList;
          break;
      }
      
      if (subjectList) {
        main.appendChild(subjectList.render(this.selectedPlatform));
      }
    } else if (this.currentView === 'lectures') {
      if (pageTitle) pageTitle.textContent = `${this.selectedSubject} Lectures`;
      if (backBtn) backBtn.style.display = 'block';
      
      const platform = this.selectedPlatform;
      const subject = this.selectedSubject.toLowerCase();
      window.location.href = `platforms/${platform}/${platform}-${subject}.html`;
    }
  }
}

// Initialize the homepage app
new HomepageApp();
