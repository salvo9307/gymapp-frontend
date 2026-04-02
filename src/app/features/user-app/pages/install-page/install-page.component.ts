import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Component({
  selector: 'app-install-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './install-page.component.html',
  styleUrl: './install-page.component.scss'
})
export class InstallPageComponent implements OnInit {
  deferredPrompt: BeforeInstallPromptEvent | null = null;

  isIos = false;
  isAndroid = false;
  isSafari = false;
  isStandalone = false;
  canInstall = false;
  isInAppBrowser = false;

  ngOnInit(): void {
    const ua = window.navigator.userAgent.toLowerCase();

    this.isIos = /iphone|ipad|ipod/.test(ua);
    this.isAndroid = /android/.test(ua);

    this.isSafari =
      /safari/.test(ua) &&
      !/chrome|crios|fxios|edg|opr|opera/.test(ua);

    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ((window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    this.isInAppBrowser =
      /instagram|fbav|fban|messenger|linkedinapp|snapchat|tiktok/.test(ua);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    this.canInstall = true;
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      this.deferredPrompt = null;
      this.canInstall = false;
    }
  }
}