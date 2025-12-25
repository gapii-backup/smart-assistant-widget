import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WIDGET_CONFIG = {
  // Display
  mode: 'dark' as 'light' | 'dark',
  position: 'right' as 'left' | 'right',
  verticalOffset: 24, // px from bottom - moves trigger, widget and bubble together
  triggerStyle: 'floating' as 'floating' | 'edge', // 'floating' = round button, 'edge' = side tab
  
  // Edge trigger settings (only used when triggerStyle is 'edge')
  edgeTriggerText: 'Klikni me',
  
  // Colors
  primaryColor: '#3B82F6',
  headerStyle: 'gradient' as 'gradient' | 'solid', // 'gradient' = fades to background, 'solid' = full primary color
  
  // Branding  
  botName: 'AI Asistent',
  botAvatar: '', // URL do slike - če je prazno, uporabi botIcon
  
  // Bot icon - SVG path (24x24 viewBox) - prikazuje se na home, v headerju in pri sporočilih
  // Najdi ikone na: https://lucide.dev/icons ali https://heroicons.com
  // Uporabi array SVG path-ov za kompleksne ikone
  botIcon: [
    'M3 11h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11z',
    'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'M12 7v4',
    'M8 16h0',
    'M16 16h0'
  ], // robot
  botIconBackground: '#ffffff', // barva ozadja ikone bota
  botIconColor: '#EF4444', // barva ikone bota (rdeča)
  
  // Trigger icon - SVG path (24x24 viewBox)
  // Privzeta chat ikona je spodaj. Zamenjaj z drugim SVG path-om!
  triggerIcon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', // chat bubble
  
  // Texts
  homeTitle: 'Pozdravljeni!',
  homeSubtitleLine2: 'Kako vam lahko pomagam?',
  homeSubtitle: '',
  welcomeMessage: '👋 Pozdravljeni! Kako vam lahko pomagam?',
  messagePlaceholder: 'Napišite vprašanje...',
  
  // Quick questions
  quickQuestions: [
    'Cena storitev?',
    'Kako začeti?',
    'Govori z agentom',
    'Kakšne so prednosti?'
  ],
  
  // Fields
  showEmailField: true,
  
  // Webhooks  
  webhookUrl: 'https://hub.botmotion.ai/webhook/051e33f1-1f96-4722-af95-a28f2f3afd01/chat',
  leadWebhookUrl: 'https://hub.botmotion.ai/webhook/lead',
  healthCheckUrl: 'https://hub.botmotion.ai/webhook/health-check',
  
  // Support/Contact
  supportEnabled: true,
  supportWebhookUrl: 'https://hub.botmotion.ai/webhook/support',
  
  // Booking
  bookingEnabled: true,
  bookingUrl: 'https://cal.botmotion.ai/admin/demo-klic',
  
  // Footer
  footerPrefix: '⚡ Powered by ',
  footerLinkText: 'BotMotion.ai Slovenia',
  footerLinkUrl: 'https://botmotion.ai',
  footerSuffix: ' ⚡',
  
  // Identification
  tableName: 'x001_botmotion',
  
  // Typing messages
  typingMessages: [
    'Preverjam podatke...',
    'Analiziram vprašanje...',
    'Iščem najboljši odgovor...'
  ]
};

// ============================================================================
// STYLES
// ============================================================================

const WIDGET_STYLES = `
  .bm-widget-container * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .bm-widget-container {
    --bm-primary: ${WIDGET_CONFIG.primaryColor};
    --bm-primary-hover: ${adjustColor(WIDGET_CONFIG.primaryColor, -10)};
    --bm-bg: ${WIDGET_CONFIG.mode === 'dark' ? '#0f0f0f' : '#ffffff'};
    --bm-bg-secondary: ${WIDGET_CONFIG.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
    --bm-text: ${WIDGET_CONFIG.mode === 'dark' ? '#ffffff' : '#0f0f0f'};
    --bm-text-muted: ${WIDGET_CONFIG.mode === 'dark' ? '#888888' : '#666666'};
    --bm-border: ${WIDGET_CONFIG.mode === 'dark' ? '#2a2a2a' : '#e5e5e5'};
    --bm-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    position: fixed;
    bottom: ${WIDGET_CONFIG.verticalOffset}px;
    ${WIDGET_CONFIG.position}: 24px;
    z-index: 999999;
    font-size: 14px;
    line-height: 1.5;
  }

  /* Trigger Button */
  .bm-trigger {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--bm-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.4)};
    transition: all 0.2s ease;
    position: relative;
  }

  .bm-trigger:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.5)};
  }

  .bm-trigger svg {
    width: 28px;
    height: 28px;
    color: white;
    transition: transform 0.2s ease;
  }

  .bm-trigger img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }

  .bm-trigger.open svg {
    transform: rotate(90deg);
  }

  /* Notification dot with ripple */
  .bm-trigger-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    border: 2px solid var(--bm-primary);
  }

  .bm-trigger-dot::before,
  .bm-trigger-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: translate(-50%, -50%);
    animation: bm-ripple 2s ease-out infinite;
  }

  .bm-trigger-dot::after {
    animation-delay: 1s;
  }

  @keyframes bm-ripple {
    0% {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
    100% {
      width: 300%;
      height: 300%;
      opacity: 0;
    }
  }

  .bm-trigger.open .bm-trigger-dot {
    display: none;
  }

  /* Edge Trigger Style */
  .bm-trigger-edge {
    position: fixed;
    ${WIDGET_CONFIG.position}: 0;
    bottom: ${WIDGET_CONFIG.verticalOffset}px;
    background: var(--bm-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 10px;
    border-radius: ${WIDGET_CONFIG.position === 'right' ? '8px 0 0 8px' : '0 8px 8px 0'};
    box-shadow: -4px 0 20px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.3)};
    transition: all 0.2s ease;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    z-index: 999999;
  }

  .bm-trigger-edge:hover {
    ${WIDGET_CONFIG.position === 'right' ? 'transform: translateX(-4px);' : 'transform: translateX(4px);'}
    box-shadow: -6px 0 28px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.4)};
  }

  .bm-trigger-edge svg {
    width: 20px;
    height: 20px;
    color: white;
    transform: rotate(${WIDGET_CONFIG.position === 'right' ? '0deg' : '180deg'});
  }

  .bm-trigger-edge img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .bm-trigger-edge span {
    color: white;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .bm-trigger-edge .bm-edge-dot {
    position: absolute;
    top: 8px;
    ${WIDGET_CONFIG.position === 'right' ? 'left: -5px;' : 'right: -5px;'}
    width: 12px;
    height: 12px;
    background: #22c55e;
    border-radius: 50%;
    border: 2px solid white;
  }

  .bm-trigger-edge .bm-edge-dot::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.6);
    transform: translate(-50%, -50%);
    animation: bm-ripple 2s ease-out infinite;
  }

  .bm-trigger-edge.open .bm-edge-dot {
    display: none;
  }

  /* Welcome Bubble */
  .bm-welcome-bubble {
    position: absolute;
    bottom: ${WIDGET_CONFIG.triggerStyle === 'edge' ? (WIDGET_CONFIG.verticalOffset + 66) : (WIDGET_CONFIG.verticalOffset + 48)}px;
    ${WIDGET_CONFIG.position}: 0;
    background: var(--bm-primary);
    border: none;
    border-radius: 20px;
    padding: 14px 20px;
    box-shadow: 0 4px 20px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.4)};
    max-width: 500px;
    width: max-content;
    cursor: pointer;
    animation: bm-slide-up 0.3s ease;
  }

  .bm-welcome-bubble p {
    color: white;
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .bm-welcome-bubble:hover p {
    padding-right: 0;
  }

  .bm-welcome-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .bm-welcome-bubble:hover .bm-welcome-close {
    opacity: 1;
  }

  .bm-welcome-close:hover {
    background: white;
    transform: scale(1.1);
  }

  .bm-welcome-close svg {
    width: 12px;
    height: 12px;
    color: #666;
  }

  /* Main Widget */
  .bm-widget {
    position: absolute;
    bottom: ${WIDGET_CONFIG.verticalOffset + 48}px;
    ${WIDGET_CONFIG.position}: 0;
    width: 420px;
    height: 716px;
    background: var(--bm-bg);
    border-radius: 16px;
    box-shadow: 0 10px 60px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: bm-slide-up 0.25s ease;
    border: none;
  }

  @keyframes bm-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* View transition animations */
  @keyframes bm-view-slide-left {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bm-view-slide-right {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .bm-view-enter-left {
    animation: bm-view-slide-left 0.3s ease-out;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .bm-view-enter-right {
    animation: bm-view-slide-right 0.3s ease-out;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .bm-view-enter-none {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* Home View Wrapper */
  .bm-home-view {
    background: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'var(--bm-primary)' : 'transparent'};
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Header - Home */
  .bm-header-home {
    background: ${WIDGET_CONFIG.headerStyle === 'solid' 
      ? `var(--bm-primary)` 
      : `linear-gradient(180deg, ${adjustColor(WIDGET_CONFIG.primaryColor, -30)} 0%, ${adjustColor(WIDGET_CONFIG.primaryColor, -30)} 50%, var(--bm-bg) 100%)`};
    padding: 16px 20px 32px;
    text-align: center;
    flex-shrink: 0;
    position: relative;
  }

  .bm-header-home-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
  }

  .bm-close-btn-home {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .bm-close-btn-home:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .bm-close-btn-home svg {
    width: 18px;
    height: 18px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Show close button on mobile */
  @media (max-width: 480px) {
    .bm-close-btn-home {
      display: flex;
    }
  }

  .bm-history-btn {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .bm-history-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .bm-history-btn svg {
    width: 18px;
    height: 18px;
    color: rgba(255, 255, 255, 0.7);
  }

  .bm-monitor-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: ${WIDGET_CONFIG.botIconBackground};
    margin: 16px auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px ${hexToRgba(WIDGET_CONFIG.botIconBackground, 0.4)};
  }

  .bm-monitor-icon svg {
    width: 32px;
    height: 32px;
    color: ${WIDGET_CONFIG.botIconColor};
  }

  .bm-header-home h2 {
    color: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'white' : (WIDGET_CONFIG.mode === 'dark' ? 'white' : '#0f0f0f')};
    font-size: 28px;
    font-weight: 800;
    margin: 0;
    line-height: 1.25;
    text-shadow: ${WIDGET_CONFIG.headerStyle === 'solid' ? '0 2px 4px rgba(0, 0, 0, 0.15)' : 'none'};
    letter-spacing: -0.5px;
  }

  .bm-header-home h2 span {
    display: block;
  }

  .bm-header-home h2 span:first-child {
    font-size: 32px;
    margin-bottom: 4px;
  }

  .bm-header-home h2 span:last-child {
    font-weight: 600;
    opacity: 0.95;
  }

  /* Header - Chat */
  .bm-header-chat {
    background: linear-gradient(135deg, var(--bm-primary), ${adjustColor(WIDGET_CONFIG.primaryColor, -20)});
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .bm-back-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .bm-back-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .bm-back-btn svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  .bm-header-info {
    flex: 1;
    text-align: left;
  }

  .bm-header-info h3 {
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .bm-header-info span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
  }

  .bm-online-status {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
  }

  .bm-online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    animation: bm-pulse-online 2s ease-in-out infinite;
  }

  @keyframes bm-pulse-online {
    0%, 100% {
      opacity: 1;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    }
    50% {
      opacity: 0.6;
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
    }
  }

  .bm-close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .bm-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .bm-close-btn svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  /* Avatar */
  .bm-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: ${WIDGET_CONFIG.botIconBackground};
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px ${hexToRgba(WIDGET_CONFIG.botIconBackground, 0.3)};
    overflow: hidden;
  }

  .bm-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .bm-avatar svg {
    width: 32px;
    height: 32px;
    color: ${WIDGET_CONFIG.botIconColor};
  }

  .bm-avatar-small {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border-radius: 50%;
    background: ${WIDGET_CONFIG.botIconBackground};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 22px;
    box-shadow: 0 2px 6px ${hexToRgba(WIDGET_CONFIG.botIconBackground, 0.3)};
  }

  .bm-avatar-small svg {
    width: 16px !important;
    height: 16px !important;
    min-width: 16px;
    min-height: 16px;
    color: ${WIDGET_CONFIG.botIconColor};
    flex-shrink: 0;
  }

  .bm-avatar-header {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    background: ${WIDGET_CONFIG.botIconBackground};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 2px 8px ${hexToRgba(WIDGET_CONFIG.botIconBackground, 0.3)};
  }

  .bm-avatar-header svg {
    width: 20px;
    height: 20px;
    color: ${WIDGET_CONFIG.botIconColor};
  }

  .bm-avatar-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }


  .bm-header h2 {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .bm-header p {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    margin: 0;
  }

  /* Quick Questions */
  .bm-quick-section {
    padding: 0 20px 16px;
    background: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'var(--bm-primary)' : 'transparent'};
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bm-quick-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--bm-text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
    text-align: center;
    background: var(--bm-bg);
    padding: 8px 16px;
    border-radius: 20px;
  }

  .bm-quick-questions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .bm-quick-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    color: var(--bm-text);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .bm-quick-btn:hover {
    background: ${WIDGET_CONFIG.mode === 'dark' ? '#252525' : '#eaeaea'};
    border-color: var(--bm-primary);
  }

  .bm-quick-btn-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .bm-quick-btn-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--bm-primary);
  }

  .bm-quick-btn svg {
    width: 16px;
    height: 16px;
    color: var(--bm-text-muted);
  }

  /* Bottom Fixed Section (email + message input) */
  .bm-bottom-section {
    margin-top: auto;
    flex-shrink: 0;
    background: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'var(--bm-primary)' : 'var(--bm-bg)'};
  }

  /* Input Stack */
  .bm-input-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 20px 8px;
    background: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'var(--bm-primary)' : 'transparent'};
  }

  .bm-input-full {
    width: 100%;
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    color: var(--bm-text);
    font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .bm-input-full:focus {
    outline: none;
    border-color: var(--bm-primary);
    box-shadow: 0 0 0 3px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.15)};
  }

  .bm-input-full::placeholder {
    color: var(--bm-text-muted);
  }

  /* Message Input Area */
  .bm-message-input-area {
    padding: 8px 20px 8px;
    background: ${WIDGET_CONFIG.headerStyle === 'solid' ? 'var(--bm-primary)' : 'var(--bm-bg)'};
  }

  .bm-message-input-wrapper {
    display: flex;
    align-items: center;
    background: var(--bm-bg);
    border: 2px solid var(--bm-primary);
    border-radius: 24px;
    padding: 6px 6px 6px 20px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 20px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.25)};
  }

  .bm-message-input-wrapper:focus-within {
    border-color: var(--bm-primary);
    box-shadow: 0 4px 20px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.25)};
    background: var(--bm-bg);
  }

  .bm-message-input-wrapper.has-text {
    border-color: var(--bm-primary);
    background: var(--bm-bg);
  }

  .bm-message-input-wrapper textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--bm-text);
    font-size: 15px;
    padding: 10px 0;
    outline: none;
    resize: none;
    font-family: inherit;
    line-height: 1.4;
    min-height: 24px;
    max-height: 72px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .bm-message-input-wrapper textarea::placeholder {
    color: ${WIDGET_CONFIG.mode === 'dark' ? '#666666' : '#555555'};
  }

  .bm-message-input-wrapper textarea::-webkit-scrollbar {
    display: none;
  }

  .bm-send-btn-home {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--bm-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 8px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.4)};
  }

  .bm-send-btn-home:hover {
    background: var(--bm-primary-hover);
    transform: scale(1.08);
    box-shadow: 0 4px 16px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.5)};
  }

  .bm-send-btn-home:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .bm-send-btn-home svg {
    width: 20px;
    height: 20px;
    color: white;
  }

  /* Content */
  .bm-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .bm-content::-webkit-scrollbar {
    width: 6px;
  }

  .bm-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .bm-content::-webkit-scrollbar-thumb {
    background: var(--bm-border);
    border-radius: 3px;
  }

  /* Form */
  .bm-form-group {
    margin-bottom: 8px;
    position: relative;
    padding-bottom: 18px;
  }

  .bm-form-group label {
    display: block;
    color: var(--bm-text);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .bm-form-group label span {
    color: var(--bm-text-muted);
    font-weight: 400;
  }

  .bm-input {
    width: 100%;
    padding: 12px 16px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    color: var(--bm-text);
    font-size: 16px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    /* Prevent zoom on iOS */
    -webkit-text-size-adjust: 100%;
  }

  /* Prevent zoom on all input elements on mobile */
  @media (max-width: 480px) {
    .bm-input,
    .bm-message-input,
    .bm-phone-number,
    textarea,
    input[type="text"],
    input[type="email"],
    input[type="tel"] {
      font-size: 16px !important;
      -webkit-text-size-adjust: 100%;
      transform: scale(1);
    }
  }

  .bm-input:focus {
    outline: none;
    border-color: var(--bm-primary);
    box-shadow: 0 0 0 3px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.15)};
  }

  .bm-input::placeholder {
    color: var(--bm-text-muted);
  }

  .bm-textarea {
    min-height: 150px;
    max-height: 150px;
    resize: none;
  }

  .bm-email-domains {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .bm-email-domain-btn {
    padding: 6px 10px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 8px;
    color: var(--bm-text-muted);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .bm-email-domain-btn:hover {
    background: var(--bm-primary);
    border-color: var(--bm-primary);
    color: white;
  }

  .bm-input-error {
    border-color: #ef4444 !important;
  }

  .bm-input-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  }

  .bm-error-message {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .bm-error-message::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
  }

  .bm-submit-btn {
    width: 100%;
    height: 48px;
    background: var(--bm-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
  }

  .bm-submit-btn:hover {
    background: var(--bm-primary-hover);
  }

  .bm-submit-btn:active {
    transform: scale(0.98);
  }

  .bm-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .bm-submit-btn.bm-sending {
    animation: bm-pulse-btn 1s ease-in-out infinite;
  }

  @keyframes bm-pulse-btn {
    0%, 100% {
      box-shadow: 0 0 0 0 ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.4)};
    }
    50% {
      box-shadow: 0 0 0 10px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0)};
    }
  }

  .bm-submit-btn .bm-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: bm-spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes bm-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .bm-success-animation {
    animation: bm-success-bounce 0.5s ease-out;
  }

  @keyframes bm-success-bounce {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Messages */
  .bm-messages {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .bm-message {
    display: flex;
    gap: 10px;
    animation: bm-fade-in 0.2s ease;
    align-items: flex-end;
  }

  @keyframes bm-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .bm-message.user {
    flex-direction: row-reverse;
  }

  .bm-message-content {
    max-width: 80%;
  }

  .bm-message.user .bm-message-content {
    text-align: right;
  }

  .bm-bubble {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  .bm-message.bot .bm-bubble {
    background: var(--bm-bg-secondary);
    color: var(--bm-text);
    border-bottom-left-radius: 6px;
  }

  .bm-message.user .bm-bubble {
    background: var(--bm-primary);
    color: white;
    border-bottom-right-radius: 6px;
  }

  .bm-timestamp {
    font-size: 11px;
    color: var(--bm-text-muted);
    margin-top: 4px;
  }

  .bm-message.user .bm-timestamp {
    text-align: right;
  }

  /* Typing Indicator */
  .bm-typing {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: bm-fade-in 0.2s ease;
  }

  .bm-typing-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bm-typing-dots {
    display: flex;
    gap: 4px;
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border-radius: 18px;
    border-bottom-left-radius: 6px;
    width: fit-content;
  }

  .bm-typing-dot {
    width: 8px;
    height: 8px;
    background: var(--bm-text-muted);
    border-radius: 50%;
    animation: bm-bounce 1.4s ease-in-out infinite;
  }

  .bm-typing-dot:nth-child(1) {
    animation-delay: 0s;
  }

  .bm-typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .bm-typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bm-bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-6px);
    }
  }

  .bm-typing-status {
    font-size: 12px;
    color: var(--bm-text-muted);
    font-style: italic;
    padding-left: 4px;
  }

  /* Input Area */
  .bm-input-area {
    padding: 16px 20px;
    border-top: 1px solid var(--bm-border);
    display: flex;
    gap: 10px;
    background: var(--bm-bg);
    flex-shrink: 0;
    align-items: center;
  }

  .bm-chat-input {
    flex: 1;
    padding: 12px 18px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 24px;
    color: var(--bm-text);
    font-size: 14px;
    transition: border-color 0.2s ease, height 0.15s ease;
    resize: none;
    font-family: inherit;
    line-height: 1.4;
    min-height: 44px;
    max-height: 64px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .bm-chat-input::-webkit-scrollbar {
    display: none;
  }

  .bm-chat-input:focus {
    outline: none;
    border-color: var(--bm-primary);
  }

  .bm-chat-input::placeholder {
    color: var(--bm-text-muted);
  }

  .bm-send-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: var(--bm-primary);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .bm-send-btn:hover {
    background: var(--bm-primary-hover);
  }

  .bm-send-btn:active {
    transform: scale(0.95);
  }

  .bm-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .bm-send-btn svg {
    width: 20px;
    height: 20px;
    color: white;
  }

  /* Navigation */
  .bm-nav {
    display: flex;
    border-top: 1px solid var(--bm-border);
    background: var(--bm-bg);
    flex-shrink: 0;
  }

  .bm-nav-item {
    flex: 1;
    padding: 14px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: background 0.2s ease;
  }

  .bm-nav-item:hover {
    background: var(--bm-bg-secondary);
  }

  .bm-nav-item.active {
    color: var(--bm-primary);
  }

  .bm-nav-item svg {
    width: 20px;
    height: 20px;
    color: var(--bm-text-muted);
  }

  .bm-nav-item.active svg {
    color: var(--bm-primary);
  }

  .bm-nav-item span {
    font-size: 11px;
    color: var(--bm-text-muted);
  }

  .bm-nav-item.active span {
    color: var(--bm-primary);
    font-weight: 500;
  }

  /* Footer */
  .bm-footer {
    padding: 0 10px !important;
    margin: 0 !important;
    border-top: 1px solid var(--bm-border);
    background: var(--bm-bg);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    white-space: nowrap;
    line-height: 1;

    /* hard lock height (prevents “tall footer” on published) */
    flex: 0 0 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    overflow: hidden;
    box-sizing: border-box;
  }

  .bm-footer span {
    color: var(--bm-text-muted);
    font-size: 12px;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .bm-footer a {
    color: var(--bm-primary);
    font-size: 12px;
    line-height: 1;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.25s ease;
    position: relative;
    margin: 0;
    padding: 0;
  }

  .bm-footer a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 50%;
    background: var(--bm-primary);
    transition: all 0.3s ease;
  }

  .bm-footer a:hover {
    color: ${WIDGET_CONFIG.mode === 'dark' ? adjustColor(WIDGET_CONFIG.primaryColor, 30) : adjustColor(WIDGET_CONFIG.primaryColor, -20)};
    text-shadow: ${WIDGET_CONFIG.mode === 'dark' ? `0 0 8px ${hexToRgba(WIDGET_CONFIG.primaryColor, 0.5)}` : 'none'};
  }

  .bm-footer a:hover::after {
    width: 100%;
    left: 0;
  }

  /* Message links */
  .bm-link {
    color: var(--bm-primary);
    text-decoration: underline;
    word-break: break-all;
  }

  .bm-link:hover {
    color: ${adjustColor(WIDGET_CONFIG.primaryColor, 20)};
  }

  /* Message lists */
  .bm-list {
    margin: 8px 0;
    padding-left: 20px;
    list-style-position: outside;
  }

  ul.bm-list {
    list-style-type: disc;
  }

  ol.bm-list {
    list-style-type: decimal;
  }

  .bm-list li {
    margin: 4px 0;
  }

  /* Email validation error */
  .bm-email-error {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 4px;
  }

  .bm-email-hint {
    color: var(--bm-text-muted);
    font-size: 11px;
    margin-top: 4px;
    padding-left: 4px;
  }

  .bm-input-full.error {
    border-color: #ef4444;
  }

  .bm-input-full.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  /* History */
  .bm-history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bm-history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .bm-history-item:hover {
    border-color: var(--bm-primary);
  }

  .bm-history-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    background: var(--bm-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bm-history-icon svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  .bm-history-content {
    flex: 1;
    min-width: 0;
  }

  .bm-history-item h4 {
    color: var(--bm-text);
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bm-history-item p {
    color: var(--bm-text-muted);
    font-size: 12px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bm-history-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }

  .bm-history-date {
    color: var(--bm-text-muted);
    font-size: 11px;
    white-space: nowrap;
  }

  .bm-history-arrow {
    color: var(--bm-text-muted);
  }

  .bm-history-arrow svg {
    width: 16px;
    height: 16px;
  }

  .bm-history-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--bm-border);
    background: var(--bm-bg);
    flex-shrink: 0;
  }

  .bm-new-chat-btn {
    margin-top: 0;
  }

  /* Action Buttons */
  .bm-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: var(--bm-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 10px;
    transition: background 0.2s ease;
  }

  .bm-action-btn:hover {
    background: var(--bm-primary-hover);
  }

  .bm-action-btn svg {
    width: 16px;
    height: 16px;
  }

  /* Newsletter Form */
  .bm-newsletter {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  .bm-newsletter input {
    flex: 1;
    padding: 10px 14px;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 8px;
    color: var(--bm-text);
    font-size: 13px;
  }

  .bm-newsletter input:focus {
    outline: none;
    border-color: var(--bm-primary);
  }

  .bm-newsletter input.bm-input-error {
    border-color: #ef4444;
  }

  .bm-newsletter input.bm-input-error:focus {
    border-color: #ef4444;
  }

  .bm-newsletter button {
    padding: 10px 16px;
    background: var(--bm-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .bm-newsletter button:hover {
    background: var(--bm-primary-hover);
  }

  .bm-newsletter {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    overflow: hidden;
    max-height: none;
    opacity: 1;
    transition: max-height 0.3s ease-out, opacity 0.2s ease-out, margin 0.3s ease-out;
  }

  .bm-newsletter:empty {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
  }

  .bm-newsletter-form {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .bm-newsletter-form input {
    flex: 1;
    padding: 10px 14px;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 8px;
    color: var(--bm-text);
    font-size: 13px;
  }

  .bm-newsletter-form input:focus {
    outline: none;
    border-color: var(--bm-primary);
  }

  .bm-newsletter-form input.bm-input-error {
    border-color: #ef4444;
  }

  .bm-newsletter-form button {
    padding: 10px 16px;
    background: var(--bm-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
  }

  .bm-newsletter-form button:hover {
    background: var(--bm-primary-hover);
  }

  /* Product Cards Carousel */
  .bm-products-carousel {
    position: relative;
    width: 100%;
    padding: 8px 0;
  }

  /* Arrow buttons - positioned in dots row */
  .bm-carousel-arrow {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    color: var(--bm-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .bm-carousel-arrow:hover:not(.bm-carousel-arrow-disabled) {
    background: var(--bm-primary);
    border-color: var(--bm-primary);
    color: white;
  }

  .bm-carousel-arrow-disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Carousel track - flex container */
  .bm-carousel-track {
    display: flex;
    transition: transform 0.3s ease-out;
  }

  .bm-carousel-track.bm-swiping {
    transition: none;
  }

  /* Product card wrapper - each card takes full width */
  .bm-product-card-wrapper {
    flex: 0 0 100%;
    min-width: 0;
  }

  /* Large product card - single view */
  .bm-product-card-large {
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .bm-product-card-large:hover {
    border-color: var(--bm-primary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .bm-product-image-large {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bm-product-image-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .bm-product-card-large:hover .bm-product-image-large img {
    transform: scale(1.03);
  }

  .bm-product-info-large {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bm-product-info-large h5 {
    color: var(--bm-text);
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    text-align: center;
  }

  .bm-product-desc-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bm-product-desc-large {
    color: var(--bm-text-muted);
    font-size: 13px;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .bm-product-desc-expanded {
    display: block;
    -webkit-line-clamp: unset;
    overflow: visible;
  }

  .bm-show-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--bm-primary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 0;
    transition: all 0.2s ease;
    align-self: flex-start;
  }

  .bm-show-more-btn:hover {
    opacity: 0.8;
  }

  .bm-product-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 10px 16px;
    background: var(--bm-primary);
    color: white;
    font-size: 13px;
    font-weight: 500;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
    justify-content: center;
  }

  .bm-product-btn:hover {
    background: var(--bm-primary-hover);
    transform: translateY(-1px);
  }

  /* Navigation row - arrows + dots together */
  .bm-carousel-nav-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
  }

  /* Dots indicator */
  .bm-carousel-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .bm-carousel-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bm-border);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
  }

  .bm-carousel-dot:hover {
    background: var(--bm-text-muted);
  }

  .bm-carousel-dot-active {
    background: var(--bm-primary);
    width: 20px;
    border-radius: 4px;
  }

  /* Modal */
  .bm-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999999;
    animation: bm-fade-in 0.2s ease;
  }

  .bm-modal {
    width: 90%;
    max-width: 480px;
    max-height: 90vh;
    background: var(--bm-bg);
    border-radius: 16px;
    box-shadow: var(--bm-shadow);
    overflow: hidden;
    animation: bm-slide-up 0.25s ease;
  }

  /* Contact View (inline in widget) */
  .bm-contact-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .bm-contact-content {
    flex: 1 1 0;
    min-height: 0;
    padding: 20px 24px;
    padding-bottom: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .bm-contact-content::-webkit-scrollbar {
    display: none;
  }

  .bm-contact-content form {
    width: 100%;
    max-width: 100%;
  }

  .bm-contact-content h3 {
    color: var(--bm-text);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px 0;
  }

  .bm-contact-footer {
    padding: 12px 24px;
    border-top: 1px solid var(--bm-border);
    background: var(--bm-bg);
    flex-shrink: 0;
  }

  .bm-contact-footer .bm-submit-btn {
    margin: 0;
  }

  /* Booking View (inline in widget) */
  .bm-booking-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .bm-booking-iframe-wrapper {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }

  .bm-booking-iframe-wrapper iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .bm-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--bm-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bm-modal-header h3 {
    color: var(--bm-text);
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .bm-modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bm-bg-secondary);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .bm-modal-close:hover {
    background: var(--bm-border);
  }

  .bm-modal-close svg {
    width: 16px;
    height: 16px;
    color: var(--bm-text-muted);
  }

  .bm-modal-content {
    padding: 24px;
    overflow-y: auto;
  }

  .bm-modal-content iframe {
    width: 100%;
    height: 500px;
    border: none;
    border-radius: 8px;
  }

  /* Empty State */
  .bm-empty {
    text-align: center;
    padding: 40px 20px;
  }

  .bm-empty svg {
    width: 48px;
    height: 48px;
    color: var(--bm-text-muted);
    margin-bottom: 16px;
  }

  .bm-empty h4 {
    color: var(--bm-text);
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px;
  }

  .bm-empty p {
    color: var(--bm-text-muted);
    font-size: 14px;
    margin: 0;
  }

  /* Phone Input */
  .bm-phone-input-wrapper {
    display: flex;
    gap: 8px;
  }

  .bm-country-selector {
    position: relative;
  }

  .bm-country-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 100%;
    min-width: 100px;
  }

  .bm-country-btn:hover {
    background: var(--bm-border);
  }

  .bm-country-btn svg {
    width: 12px;
    height: 12px;
    color: var(--bm-text-muted);
  }

  .bm-country-flag {
    font-size: 16px;
  }

  .bm-country-code {
    color: var(--bm-text);
    font-size: 13px;
    font-weight: 500;
  }

  .bm-country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    min-width: 220px;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    box-shadow: var(--bm-shadow);
    z-index: 100;
    margin-top: 4px;
    overflow: hidden;
  }

  .bm-country-search {
    width: 100%;
    padding: 12px;
    border: none;
    border-bottom: 1px solid var(--bm-border);
    background: var(--bm-bg-secondary);
    color: var(--bm-text);
    font-size: 13px;
    outline: none;
  }

  .bm-country-search::placeholder {
    color: var(--bm-text-muted);
  }

  .bm-country-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .bm-country-option {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .bm-country-option:hover {
    background: var(--bm-bg-secondary);
  }

  .bm-country-option.active {
    background: var(--bm-primary);
  }

  .bm-country-option.active .bm-country-name,
  .bm-country-option.active .bm-country-code {
    color: white;
  }

  .bm-country-option .bm-country-name {
    flex: 1;
    color: var(--bm-text);
    font-size: 13px;
  }

  .bm-country-option .bm-country-code {
    color: var(--bm-text-muted);
    font-size: 12px;
  }

  .bm-phone-input {
    flex: 1;
  }

  /* ============================================
     MOBILE RESPONSIVE STYLES
     Supports: iPhone SE, iPhone 14 Pro Max, 
     Samsung Galaxy S20 Ultra, iPad Mini
     ============================================ */

  /* Safe area support for iPhone notch */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .bm-widget-container {
      padding-bottom: env(safe-area-inset-bottom);
    }
    
    .bm-footer {
      padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;
    }
    
    .bm-input-area {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
    
    .bm-message-input-area {
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
    }
  }

  /* Phones - Fullscreen mode (max-width: 480px) */
  @media (max-width: 480px) {
    .bm-widget-container {
      bottom: 16px;
      ${WIDGET_CONFIG.position}: 16px;
      --keyboard-height: 0px;
    }

    .bm-widget-container.widget-open {
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      padding: 0;
    }

    .bm-trigger {
      width: 52px;
      height: 52px;
    }

    .bm-trigger svg {
      width: 24px;
      height: 24px;
    }

    /* Reduce ripple intensity on mobile */
    .bm-trigger-dot::before,
    .bm-trigger-dot::after {
      background: rgba(255, 255, 255, 0.3);
      animation: bm-ripple-mobile 2.5s ease-out infinite;
    }

    .bm-trigger-dot::after {
      animation-delay: 1.25s;
    }

    @keyframes bm-ripple-mobile {
      0% {
        width: 100%;
        height: 100%;
        opacity: 0.6;
      }
      100% {
        width: 200%;
        height: 200%;
        opacity: 0;
      }
    }

    /* Hide trigger when widget is open on mobile */
    .bm-widget-container.widget-open .bm-trigger,
    .bm-widget-container.widget-open .bm-trigger-edge {
      display: none !important;
    }

    .bm-widget {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: var(--keyboard-height, 0px) !important;
      width: 100vw !important;
      height: calc(100vh - var(--keyboard-height, 0px)) !important;
      height: calc(100dvh - var(--keyboard-height, 0px)) !important;
      max-height: none !important;
      border-radius: 0 !important;
      transition: height 0.2s ease-out, bottom 0.2s ease-out;
    }

    /* When keyboard is open, adjust the widget */
    .bm-widget-container.keyboard-open .bm-widget {
      bottom: var(--keyboard-height, 0px) !important;
      height: calc(100vh - var(--keyboard-height, 0px)) !important;
      height: calc(100dvh - var(--keyboard-height, 0px)) !important;
    }

    /* Keep input areas visible when keyboard is open */
    .bm-widget-container.keyboard-open .bm-bottom-section,
    .bm-widget-container.keyboard-open .bm-input-area {
      padding-bottom: 8px !important;
    }

    /* Reduce header size when keyboard is open to show more content */
    .bm-widget-container.keyboard-open .bm-header-home {
      padding: 12px 16px 16px;
      padding-top: calc(12px + env(safe-area-inset-top, 0px));
    }

    .bm-widget-container.keyboard-open .bm-header-home h2 {
      font-size: 20px;
    }

    .bm-widget-container.keyboard-open .bm-monitor-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    .bm-widget-container.keyboard-open .bm-monitor-icon svg {
      width: 24px;
      height: 24px;
    }

    /* Hide quick questions section when keyboard is open to save space */
    .bm-widget-container.keyboard-open .bm-quick-section {
      display: none;
    }

    /* Adjust footer when keyboard is open */
    .bm-widget-container.keyboard-open .bm-footer {
      display: none;
    }

    .bm-welcome-bubble {
      ${WIDGET_CONFIG.position}: 0;
      max-width: calc(100vw - 80px);
      padding: 10px 14px;
      bottom: 60px;
    }

    .bm-welcome-bubble p {
      font-size: 13px;
    }

    .bm-header-home {
      padding: 16px 16px 24px;
      padding-top: calc(16px + env(safe-area-inset-top, 0px));
    }

    .bm-header-home h2 {
      font-size: 24px;
    }

    .bm-monitor-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
    }

    .bm-monitor-icon svg {
      width: 28px;
      height: 28px;
    }

    .bm-quick-section {
      padding: 0 16px 12px;
    }

    .bm-quick-btn {
      padding: 14px 16px;
      font-size: 14px;
    }

    .bm-input-stack {
      padding: 0 16px 6px;
    }

    .bm-input-full {
      padding: 14px 16px;
      font-size: 14px;
    }

    /* Smaller textarea for contact form on mobile */
    .bm-textarea {
      min-height: 80px;
      max-height: 80px;
    }

    /* Hide email error message on mobile */
    .bm-email-error.bm-hide-on-mobile {
      display: none;
    }

    /* Newsletter form mobile layout */
    .bm-newsletter {
      max-height: none;
    }

    .bm-newsletter-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .bm-newsletter-form input {
      width: 100%;
    }

    .bm-newsletter-form button {
      width: 100%;
    }

    .bm-message-input-area {
      padding: 8px 16px;
    }

    .bm-message-input-wrapper {
      padding: 6px 6px 6px 16px;
    }

    .bm-message-input-wrapper textarea {
      font-size: 15px;
      padding: 10px 0;
    }

    .bm-send-btn-home {
      width: 44px;
      height: 44px;
    }

    .bm-send-btn-home svg {
      width: 20px;
      height: 20px;
    }

    .bm-header-chat {
      padding: 14px 16px;
      padding-top: calc(14px + env(safe-area-inset-top, 0px));
    }

    .bm-content {
      padding: 16px;
    }

    .bm-bubble {
      padding: 12px 16px;
      font-size: 14px;
    }

    .bm-input-area {
      padding: 14px 16px;
      padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
    }

    .bm-chat-input {
      padding: 12px 16px;
      font-size: 14px;
      min-height: 44px;
    }

    .bm-send-btn {
      width: 44px;
      height: 44px;
    }

    .bm-send-btn svg {
      width: 20px;
      height: 20px;
    }

    .bm-footer {
      flex: 0 0 40px !important;
      height: 40px !important;
      min-height: 40px !important;
      max-height: 40px !important;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
    }

    .bm-footer span,
    .bm-footer a {
      font-size: 11px;
    }
  }

  /* Small tablets (iPad Mini portrait - 481px to 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    .bm-widget-container {
      bottom: ${WIDGET_CONFIG.verticalOffset}px;
      ${WIDGET_CONFIG.position}: 24px;
    }

    .bm-widget {
      width: 400px;
      height: calc(100vh - 140px);
      max-height: 700px;
      bottom: ${WIDGET_CONFIG.verticalOffset + 48}px;
      border-radius: 16px;
    }

    .bm-welcome-bubble {
      max-width: 340px;
    }
  }

  /* Tablets landscape and larger (769px+) */
  @media (min-width: 769px) {
    .bm-widget {
      width: 420px;
      height: 716px;
      max-height: calc(100vh - 120px);
    }
  }

  /* Specific fix for 1366x768 resolution */
  @media (min-width: 1360px) and (max-width: 1370px) and (min-height: 760px) and (max-height: 775px) {
    .bm-footer {
      flex: 0 0 36px !important;
      height: 36px !important;
      min-height: 36px !important;
      padding: 8px 16px !important;
    }

    .bm-footer span,
    .bm-footer a {
      font-size: 11px;
    }

    .bm-quick-section {
      padding-bottom: 8px;
    }

    .bm-quick-btn {
      padding: 10px 14px;
    }

    .bm-header-home {
      padding: 16px 20px 20px;
    }

    .bm-textarea {
      min-height: 80px;
      max-height: 80px;
    }

    .bm-contact-content {
      padding: 16px 20px;
      padding-bottom: 4px;
      overflow-y: hidden;
    }

    .bm-form-group {
      margin-bottom: 12px;
    }
  }

  /* Very small height devices (landscape phones) */
  @media (max-height: 600px) {
    .bm-widget {
      height: calc(100vh - 80px);
      max-height: none;
      bottom: 64px;
    }

    .bm-header-home {
      padding: 10px 16px 20px;
    }

    .bm-monitor-icon {
      width: 48px;
      height: 48px;
      margin: 8px auto 12px;
    }

    .bm-header-home h2 {
      font-size: 20px;
    }

    .bm-quick-section {
      padding: 0 16px 10px;
    }

    .bm-quick-btn {
      padding: 10px 14px;
    }
  }

  /* Touch-friendly adjustments for all mobile */
  @media (hover: none) and (pointer: coarse) {
    .bm-trigger:hover {
      transform: none;
    }

    .bm-trigger:active {
      transform: scale(0.95);
    }

    .bm-quick-btn:hover {
      background: var(--bm-bg-secondary);
      border-color: var(--bm-border);
    }

    .bm-quick-btn:active {
      background: ${WIDGET_CONFIG.mode === 'dark' ? '#252525' : '#eaeaea'};
      border-color: var(--bm-primary);
    }

    .bm-send-btn:hover,
    .bm-send-btn-home:hover {
      transform: none;
    }

    .bm-send-btn:active,
    .bm-send-btn-home:active {
      transform: scale(0.95);
    }
  }
`;

// ============================================================================
// UTILITIES
// ============================================================================

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(Math.min((num >> 16) + amt, 255), 0);
  const G = Math.max(Math.min((num >> 8 & 0x00FF) + amt, 255), 0);
  const B = Math.max(Math.min((num & 0x0000FF) + amt, 255), 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const R = (num >> 16) & 255;
  const G = (num >> 8) & 255;
  const B = num & 255;
  return `rgba(${R}, ${G}, ${B}, ${alpha})`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  preview: string;
}

type View = 'home' | 'chat' | 'history' | 'contact' | 'booking';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  MessageSquare: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ArrowUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Avatar: React.FC<{ small?: boolean }> = ({ small }) => {
  const className = small ? 'bm-avatar-small' : 'bm-avatar';
  
  if (WIDGET_CONFIG.botAvatar) {
    return (
      <div className={className}>
        <img src={WIDGET_CONFIG.botAvatar} alt={WIDGET_CONFIG.botName} />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {WIDGET_CONFIG.botIcon.map((path, i) => <path key={i} d={path} />)}
      </svg>
    </div>
  );
};

// Country codes data with trunk prefix and digit limits
const COUNTRY_CODES: { code: string; country: string; flag: string; trunk: string; minDigits: number; maxDigits: number }[] = [
  // Balkanske države
  { code: '+386', country: 'Slovenija', flag: '🇸🇮', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+385', country: 'Hrvaška', flag: '🇭🇷', trunk: '0', minDigits: 8, maxDigits: 12 },
  { code: '+381', country: 'Srbija', flag: '🇷🇸', trunk: '0', minDigits: 4, maxDigits: 12 },
  { code: '+387', country: 'BiH', flag: '🇧🇦', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+382', country: 'Črna gora', flag: '🇲🇪', trunk: '0', minDigits: 4, maxDigits: 12 },
  { code: '+389', country: 'S. Makedonija', flag: '🇲🇰', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+383', country: 'Kosovo', flag: '🇽🇰', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+355', country: 'Albanija', flag: '🇦🇱', trunk: '0', minDigits: 3, maxDigits: 9 },
  // Srednja Evropa
  { code: '+43', country: 'Avstrija', flag: '🇦🇹', trunk: '0', minDigits: 4, maxDigits: 13 },
  { code: '+39', country: 'Italija', flag: '🇮🇹', trunk: '', minDigits: 6, maxDigits: 11 }, // ⚠️ 0 OSTANE!
  { code: '+36', country: 'Madžarska', flag: '🇭🇺', trunk: '06', minDigits: 8, maxDigits: 9 },
  { code: '+49', country: 'Nemčija', flag: '🇩🇪', trunk: '0', minDigits: 6, maxDigits: 13 },
  { code: '+41', country: 'Švica', flag: '🇨🇭', trunk: '0', minDigits: 4, maxDigits: 12 },
  { code: '+420', country: 'Češka', flag: '🇨🇿', trunk: '', minDigits: 4, maxDigits: 12 },
  { code: '+421', country: 'Slovaška', flag: '🇸🇰', trunk: '0', minDigits: 4, maxDigits: 9 },
  { code: '+48', country: 'Poljska', flag: '🇵🇱', trunk: '0', minDigits: 6, maxDigits: 9 },
  { code: '+40', country: 'Romunija', flag: '🇷🇴', trunk: '0', minDigits: 9, maxDigits: 9 },
  { code: '+359', country: 'Bolgarija', flag: '🇧🇬', trunk: '0', minDigits: 7, maxDigits: 9 },
  // Zahodna Evropa
  { code: '+44', country: 'V. Britanija', flag: '🇬🇧', trunk: '0', minDigits: 7, maxDigits: 10 },
  { code: '+33', country: 'Francija', flag: '🇫🇷', trunk: '0', minDigits: 9, maxDigits: 9 },
  { code: '+34', country: 'Španija', flag: '🇪🇸', trunk: '', minDigits: 9, maxDigits: 9 },
  { code: '+351', country: 'Portugalska', flag: '🇵🇹', trunk: '', minDigits: 9, maxDigits: 11 },
  { code: '+31', country: 'Nizozemska', flag: '🇳🇱', trunk: '0', minDigits: 9, maxDigits: 9 },
  { code: '+32', country: 'Belgija', flag: '🇧🇪', trunk: '0', minDigits: 8, maxDigits: 9 },
  { code: '+352', country: 'Luksemburg', flag: '🇱🇺', trunk: '', minDigits: 4, maxDigits: 11 },
  { code: '+353', country: 'Irska', flag: '🇮🇪', trunk: '0', minDigits: 7, maxDigits: 11 },
  { code: '+377', country: 'Monako', flag: '🇲🇨', trunk: '', minDigits: 5, maxDigits: 9 },
  { code: '+423', country: 'Lihtenštajn', flag: '🇱🇮', trunk: '', minDigits: 7, maxDigits: 9 },
  { code: '+376', country: 'Andora', flag: '🇦🇩', trunk: '', minDigits: 6, maxDigits: 9 },
  { code: '+378', country: 'San Marino', flag: '🇸🇲', trunk: '', minDigits: 6, maxDigits: 10 },
  { code: '+356', country: 'Malta', flag: '🇲🇹', trunk: '', minDigits: 8, maxDigits: 8 },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮', trunk: '', minDigits: 8, maxDigits: 8 },
  // Skandinavija
  { code: '+45', country: 'Danska', flag: '🇩🇰', trunk: '', minDigits: 8, maxDigits: 8 },
  { code: '+46', country: 'Švedska', flag: '🇸🇪', trunk: '0', minDigits: 7, maxDigits: 13 },
  { code: '+47', country: 'Norveška', flag: '🇳🇴', trunk: '', minDigits: 5, maxDigits: 8 },
  { code: '+358', country: 'Finska', flag: '🇫🇮', trunk: '0', minDigits: 5, maxDigits: 12 },
  { code: '+354', country: 'Islandija', flag: '🇮🇸', trunk: '', minDigits: 7, maxDigits: 9 },
  { code: '+298', country: 'Ferski otoki', flag: '🇫🇴', trunk: '', minDigits: 6, maxDigits: 6 },
  // Vzhodna Evropa in Baltik
  { code: '+30', country: 'Grčija', flag: '🇬🇷', trunk: '0', minDigits: 10, maxDigits: 10 },
  { code: '+90', country: 'Turčija', flag: '🇹🇷', trunk: '0', minDigits: 10, maxDigits: 10 },
  { code: '+357', country: 'Ciper', flag: '🇨🇾', trunk: '', minDigits: 8, maxDigits: 11 },
  { code: '+380', country: 'Ukrajina', flag: '🇺🇦', trunk: '0', minDigits: 9, maxDigits: 9 },
  { code: '+7', country: 'Rusija', flag: '🇷🇺', trunk: '8', minDigits: 10, maxDigits: 10 },
  { code: '+375', country: 'Belorusija', flag: '🇧🇾', trunk: '8', minDigits: 9, maxDigits: 10 },
  { code: '+373', country: 'Moldavija', flag: '🇲🇩', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+370', country: 'Litva', flag: '🇱🇹', trunk: '0', minDigits: 8, maxDigits: 8 },
  { code: '+371', country: 'Latvija', flag: '🇱🇻', trunk: '', minDigits: 7, maxDigits: 8 },
  { code: '+372', country: 'Estonija', flag: '🇪🇪', trunk: '', minDigits: 7, maxDigits: 10 },
  // Severna Amerika
  { code: '+1', country: 'ZDA / Kanada', flag: '🇺🇸', trunk: '1', minDigits: 10, maxDigits: 10 },
];

// Format phone number with spaces based on country
const formatPhoneNumber = (value: string, trunk: string, maxDigits: number): string => {
  let digits = value.replace(/\D/g, '');
  
  // Remove trunk prefix based on country
  if (trunk === '0' && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (trunk === '8' && digits.startsWith('8')) {
    digits = digits.slice(1);
  } else if (trunk === '1' && digits.startsWith('1')) {
    digits = digits.slice(1);
  } else if (trunk === '06' && digits.startsWith('06')) {
    digits = digits.slice(2);
  }
  // Note: Italy (trunk='') keeps the 0!
  
  // Limit to max digits
  digits = digits.slice(0, maxDigits);
  
  // Format based on length
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
};

const ContactForm: React.FC<{
  onClose: () => void;
  chatHistory: Message[];
  onSuccess?: () => void;
  sessionId?: string;
}> = ({ onClose, chatHistory, onSuccess, sessionId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+386');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry.trunk, selectedCountry.maxDigits);
    setPhone(formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Prosimo, vnesite ime in priimek';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Prosimo, vnesite email naslov';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Prosimo, vnesite veljaven email naslov';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Prosimo, vnesite sporočilo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    const fullPhone = phone ? `${countryCode} ${phone}` : undefined;

    try {
      await fetch(WIDGET_CONFIG.supportWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name,
          email,
          phone: fullPhone,
          message,
          chatHistory: chatHistory.map(m => 
            `${m.role === 'user' ? '👤 User' : '🤖 Bot'}: ${m.content}`
          ).join('\n\n'),
          tableName: WIDGET_CONFIG.tableName
        })
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-contact-view">
      <div className="bm-contact-content">
        {success ? (
          <div className="bm-empty bm-success-animation" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', minHeight: '300px' }}>
            <Icons.Mail />
            <h4>Sporočilo poslano!</h4>
            <p>Hvala za vaše sporočilo. Odgovorili vam bomo v najkrajšem možnem času.</p>
          </div>
        ) : (
            <form onSubmit={handleSubmit} noValidate id="bm-contact-form">
              <div className="bm-form-group">
                <label>Ime in priimek</label>
                <input
                  type="text"
                  className={`bm-input ${errors.name ? 'bm-input-error' : ''}`}
                  placeholder="Vaše ime in priimek"
                  autoComplete="name"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                />
                {errors.name && <div className="bm-error-message">{errors.name}</div>}
              </div>
              <div className="bm-form-group">
                <label>Email</label>
                <input
                  type="email"
                  className={`bm-input ${errors.email ? 'bm-input-error' : ''}`}
                  placeholder="vas.email@primer.si"
                  autoComplete="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                />
                {errors.email && <div className="bm-error-message">{errors.email}</div>}
              </div>
              <div className="bm-form-group">
                <label>Telefon <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcijsko)</span></label>
                <div className="bm-phone-input-wrapper">
                  <div className="bm-country-selector" ref={dropdownRef}>
                    <button 
                      type="button"
                      className="bm-country-btn"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    >
                      <span className="bm-country-flag">{selectedCountry.flag}</span>
                      <span className="bm-country-code">{selectedCountry.code}</span>
                      <Icons.ChevronDown />
                    </button>
                    {showCountryDropdown && (
                      <div className="bm-country-dropdown">
                        <input
                          type="text"
                          className="bm-country-search"
                          placeholder="Išči državo..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          autoFocus
                        />
                        <div className="bm-country-list">
                          {filteredCountries.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              className={`bm-country-option ${c.code === countryCode ? 'active' : ''}`}
                              onClick={() => {
                                setCountryCode(c.code);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                            >
                              <span className="bm-country-flag">{c.flag}</span>
                              <span className="bm-country-name">{c.country}</span>
                              <span className="bm-country-code">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    className="bm-input bm-phone-input"
                    placeholder="XX XXX XXX"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="bm-form-group">
                <label>Sporočilo</label>
                <textarea
                  className={`bm-input bm-textarea ${errors.message ? 'bm-input-error' : ''}`}
                  placeholder="Kako vam lahko pomagamo?"
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                  }}
                />
                {errors.message && <div className="bm-error-message">{errors.message}</div>}
              </div>
            </form>
          )}
        </div>
        {!success && (
          <div className="bm-contact-footer">
            <button type="submit" form="bm-contact-form" className={`bm-submit-btn ${loading ? 'bm-sending' : ''}`} disabled={loading}>
              {loading ? <><span className="bm-spinner"></span>Pošiljam...</> : 'Pošlji sporočilo'}
            </button>
          </div>
        )}
        <div className="bm-footer">
          <span>{WIDGET_CONFIG.footerPrefix}</span>
          <a href={WIDGET_CONFIG.footerLinkUrl} target="_blank" rel="noopener noreferrer">{WIDGET_CONFIG.footerLinkText}</a>
          <span>{WIDGET_CONFIG.footerSuffix}</span>
        </div>
      </div>
  );
};

const BookingView: React.FC<{ onClose: () => void; onSuccess?: () => void; showSuccess: boolean }> = ({ onClose, onSuccess, showSuccess }) => {
  const hasCalledSuccess = useRef(false);

  const handleBookingSuccess = useCallback(() => {
    if (hasCalledSuccess.current) return;
    hasCalledSuccess.current = true;
    console.log('Booking success handler called (once)');
    onSuccess?.();
  }, [onSuccess]);

  useEffect(() => {
    // Reset flag when component mounts
    hasCalledSuccess.current = false;
  }, []);

  useEffect(() => {
    // Listen for Cal.com booking success events via postMessage
    const handleCalMessage = (e: MessageEvent) => {
      // Debug: log all messages from Cal.com domain
      if (e.origin?.includes('cal.com') || e.origin?.includes('cal.botmotion')) {
        console.log('Cal.com message received:', e.data);
      }

      // Check Cal.com event format: { originator: "CAL", type: "bookingSuccessfulV2", data: {...} }
      const data = e.data;
      const isBookingSuccess = 
        data?.originator === 'CAL' && (
          data?.type === 'bookingSuccessful' ||
          data?.type === 'bookingSuccessfulV2'
        );

      if (isBookingSuccess) {
        handleBookingSuccess();
      }
    };

    window.addEventListener('message', handleCalMessage);

    // Also try Cal.com's native event system if available
    const setupCalEvents = () => {
      const calNs = (window as any).Cal?.ns;
      if (calNs) {
        try {
          Object.keys(calNs).forEach(namespace => {
            calNs[namespace]?.('on', {
              action: 'bookingSuccessful',
              callback: () => handleBookingSuccess()
            });
            calNs[namespace]?.('on', {
              action: 'bookingSuccessfulV2',
              callback: () => handleBookingSuccess()
            });
          });
        } catch (err) {
          console.log('Cal.com namespace setup error:', err);
        }
      }
    };

    setupCalEvents();
    const timeoutId = setTimeout(setupCalEvents, 2000);

    return () => {
      window.removeEventListener('message', handleCalMessage);
      clearTimeout(timeoutId);
    };
  }, [handleBookingSuccess]);

  if (showSuccess) {
    return (
      <div className="bm-booking-view">
        <div className="bm-empty bm-success-animation" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', minHeight: '300px' }}>
          <Icons.Calendar />
          <h4>Termin uspešno rezerviran!</h4>
          <p>Potrditev ste prejeli na vaš email naslov.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-booking-view">
      <div className="bm-booking-iframe-wrapper">
        <iframe src={WIDGET_CONFIG.bookingUrl} title="Booking" />
      </div>
    </div>
  );
};

// ============================================================================
// PRODUCT CAROUSEL COMPONENT
// ============================================================================

interface Product {
  ime_izdelka: string;
  kratek_opis?: string;
  url: string;
  image_url?: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      setIsTruncated(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [product.kratek_opis]);

  return (
    <div className="bm-product-card-large">
      {product.image_url && (
        <div className="bm-product-image-large">
          <img src={product.image_url} alt={product.ime_izdelka || 'Produkt'} loading="lazy" />
        </div>
      )}
      <div className="bm-product-info-large">
        <h5>{product.ime_izdelka}</h5>
        {product.kratek_opis && (
          <div className="bm-product-desc-wrapper">
            <p 
              ref={descRef}
              className={`bm-product-desc-large ${isExpanded ? 'bm-product-desc-expanded' : ''}`}
            >
              {product.kratek_opis}
            </p>
            {isTruncated && !isExpanded && (
              <button 
                className="bm-show-more-btn"
                onClick={() => setIsExpanded(true)}
              >
                Prikaži več
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
            {isExpanded && (
              <button 
                className="bm-show-more-btn"
                onClick={() => setIsExpanded(false)}
              >
                Prikaži manj
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
            )}
          </div>
        )}
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bm-product-btn"
        >
          Poglej več
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>
    </div>
  );
};

const ProductCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Infinite loop navigation
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % products.length);
    setSwipeOffset(0);
  }, [products.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
    setSwipeOffset(0);
  }, [products.length]);

  // Autoplay - 5 seconds
  useEffect(() => {
    if (products.length <= 1 || isPaused || isSwiping) return;
    
    autoplayRef.current = setInterval(() => {
      goToNext();
    }, 5000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [goToNext, products.length, isPaused, isSwiping]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    
    const currentX = e.targetTouches[0].clientX;
    const offset = currentX - touchStartX.current;
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current) return;
    
    setIsSwiping(false);
    
    if (swipeOffset < -minSwipeDistance) {
      goToNext();
    } else if (swipeOffset > minSwipeDistance) {
      goToPrev();
    } else {
      setSwipeOffset(0);
    }
    
    touchStartX.current = null;
  };

  if (products.length === 0) return null;

  // Get container width for pixel-based transform
  const containerWidth = containerRef.current?.offsetWidth || 0;
  
  // Calculate transform: base position + swipe offset
  const baseTranslate = -currentIndex * 100; // percentage
  const swipeTranslatePixels = isSwiping ? swipeOffset : 0;

  const trackStyle: React.CSSProperties = {
    transform: containerWidth > 0 && isSwiping
      ? `translateX(calc(${baseTranslate}% + ${swipeTranslatePixels}px))`
      : `translateX(${baseTranslate}%)`
  };

  return (
    <div 
      ref={containerRef}
      className="bm-products-carousel" 
      style={{ marginTop: '12px', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel track with all cards */}
      <div 
        className={`bm-carousel-track ${isSwiping ? 'bm-swiping' : ''}`}
        style={trackStyle}
      >
        {products.map((product, index) => (
          <div key={index} className="bm-product-card-wrapper">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Navigation row: arrows + dots */}
      {products.length > 1 && (
        <div className="bm-carousel-nav-row">
          <button
            className="bm-carousel-arrow"
            onClick={goToPrev}
            aria-label="Prejšnji produkt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div className="bm-carousel-dots">
            {products.map((_, i) => (
              <button
                key={i}
                className={`bm-carousel-dot ${i === currentIndex ? 'bm-carousel-dot-active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Produkt ${i + 1}`}
              />
            ))}
          </div>
          
          <button
            className="bm-carousel-arrow"
            onClick={goToNext}
            aria-label="Naslednji produkt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const MessageContent: React.FC<{
  content: string;
  onContactClick: () => void;
  onBookingClick: () => void;
  sessionId?: string;
  messageId: string;
  onNewsletterSuccess?: (messageId: string) => void;
  submittedNewsletterIds: Set<string>;
}> = ({ content, onContactClick, onBookingClick, sessionId, messageId, onNewsletterSuccess, submittedNewsletterIds }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const isValidEmail = newsletterEmail.includes('@');

  const handleNewsletterSubmit = async () => {
    if (!isValidEmail) {
      setAttemptedSubmit(true);
      return;
    }
    try {
      await fetch(WIDGET_CONFIG.leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          email: newsletterEmail,
          type: 'newsletter',
          tableName: WIDGET_CONFIG.tableName
        })
      });
      onNewsletterSuccess?.(messageId);
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  };

  // Parse special markers
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // Parse inline formatting (markdown links, URLs, bold)
  const parseInlineFormatting = (text: string, startIdx: number): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let idx = startIdx;
    
    // Combined regex for markdown links [text](url), plain URLs, and **bold**
    const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>\")\]]+)|\*\*(.+?)\*\*/g;
    let match;
    let lastIndex = 0;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(<span key={idx++}>{text.slice(lastIndex, match.index)}</span>);
      }
      
      if (match[1] && match[2]) {
        // Markdown link [text](url)
        result.push(
          <a key={idx++} href={match[2]} target="_blank" rel="noopener noreferrer" className="bm-link">
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        // Plain URL
        result.push(
          <a key={idx++} href={match[3]} target="_blank" rel="noopener noreferrer" className="bm-link">
            {match[3]}
          </a>
        );
      } else if (match[4]) {
        // Bold text
        result.push(<strong key={idx++}>{match[4]}</strong>);
      }
      
      lastIndex = combinedRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      result.push(<span key={idx++}>{text.slice(lastIndex)}</span>);
    }
    
    return result.length > 0 ? result : [<span key={idx}>{text}</span>];
  };

  // Parse text with line breaks, lists, and inline formatting
  const parseTextWithFormatting = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let idx = 0;
    
    // Split by lines
    const lines = text.split('\n');
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check for bullet points (- or * or •)
      const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
      // Check for numbered list (1. or 1) etc)
      const numberMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);
      
      if (bulletMatch) {
        if (!currentList || currentList.type !== 'ul') {
          if (currentList) {
            result.push(
              currentList.type === 'ul' 
                ? <ul key={idx++} className="bm-list">{currentList.items}</ul>
                : <ol key={idx++} className="bm-list">{currentList.items}</ol>
            );
          }
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(<li key={idx++}>{parseInlineFormatting(bulletMatch[1], idx)}</li>);
      } else if (numberMatch) {
        if (!currentList || currentList.type !== 'ol') {
          if (currentList) {
            result.push(
              currentList.type === 'ul' 
                ? <ul key={idx++} className="bm-list">{currentList.items}</ul>
                : <ol key={idx++} className="bm-list">{currentList.items}</ol>
            );
          }
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(<li key={idx++}>{parseInlineFormatting(numberMatch[2], idx)}</li>);
      } else {
        // Close any open list
        if (currentList) {
          result.push(
            currentList.type === 'ul' 
              ? <ul key={idx++} className="bm-list">{currentList.items}</ul>
              : <ol key={idx++} className="bm-list">{currentList.items}</ol>
          );
          currentList = null;
        }
        
        // Regular line
        if (trimmedLine) {
          result.push(<span key={idx++}>{parseInlineFormatting(line, idx)}</span>);
        }
        
        // Add line break between lines (but not after last line)
        if (lineIndex < lines.length - 1 && !bulletMatch && !numberMatch) {
          result.push(<br key={idx++} />);
        }
      }
    });
    
    // Close any remaining open list
    if (currentList) {
      result.push(
        currentList.type === 'ul' 
          ? <ul key={idx++} className="bm-list">{currentList.items}</ul>
          : <ol key={idx++} className="bm-list">{currentList.items}</ol>
      );
    }
    
    return result;
  };

  // Contact form
  if (remaining.includes('[CONTACT_FORM]') && WIDGET_CONFIG.supportEnabled) {
    const [before, after] = remaining.split('[CONTACT_FORM]');
    if (before) parts.push(<React.Fragment key={key++}>{parseTextWithFormatting(before)}</React.Fragment>);
    parts.push(
      <div key={key++} style={{ marginTop: '8px' }}>
        <button className="bm-action-btn" onClick={onContactClick}>
          <Icons.Mail />
          Kontaktiraj nas
        </button>
      </div>
    );
    remaining = after || '';
  }

  // Booking
  if (remaining.includes('[BOOKING]') && WIDGET_CONFIG.bookingEnabled) {
    const [before, after] = remaining.split('[BOOKING]');
    if (before) parts.push(<React.Fragment key={key++}>{parseTextWithFormatting(before)}</React.Fragment>);
    parts.push(
      <div key={key++} style={{ marginTop: '8px' }}>
        <button className="bm-action-btn" onClick={onBookingClick}>
          <Icons.Calendar />
          Rezerviraj termin
        </button>
      </div>
    );
    remaining = after || '';
  }

  // Newsletter
  if (remaining.includes('[NEWSLETTER]')) {
    const [before, after] = remaining.split('[NEWSLETTER]');
    if (before) parts.push(<React.Fragment key={key++}>{parseTextWithFormatting(before)}</React.Fragment>);
    parts.push(
      <div key={key++} className="bm-newsletter" style={{ marginTop: '8px' }}>
        {submittedNewsletterIds.has(messageId) ? null : (
          <div className="bm-newsletter-form">
            <input
              type="email"
              placeholder="Vaš email"
              value={newsletterEmail}
              onChange={e => {
                setNewsletterEmail(e.target.value);
                setAttemptedSubmit(false);
              }}
              className={attemptedSubmit && !isValidEmail ? 'bm-input-error' : ''}
            />
            <button onClick={handleNewsletterSubmit}>Prijava</button>
          </div>
        )}
      </div>
    );
    remaining = after || '';
  }

  // Product cards - render ProductCarousel component
  const productMatch = remaining.match(/\[PRODUCT_CARDS\](.*?)\[\/PRODUCT_CARDS\]/s);
  if (productMatch) {
    const [before] = remaining.split('[PRODUCT_CARDS]');
    const afterProducts = remaining.split('[/PRODUCT_CARDS]')[1] || '';
    
    if (before) parts.push(<React.Fragment key={key++}>{parseTextWithFormatting(before)}</React.Fragment>);
    
    try {
      const products = JSON.parse(productMatch[1].trim());
      parts.push(<ProductCarousel key={key++} products={products} />);
    } catch (e) {
      console.error('Product cards parse error:', e);
    }
    
    remaining = afterProducts;
  }


  if (remaining) {
    parts.push(
      <React.Fragment key={key++}>
        {parseTextWithFormatting(remaining)}
      </React.Fragment>
    );
  }

  return <>{parts.length > 0 ? parts : parseTextWithFormatting(content)}</>;
};

// ============================================================================
// MAIN WIDGET
// ============================================================================

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpenState] = useState(() => {
    // Only restore open state on desktop (> 768px)
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      return localStorage.getItem('bm-widget-open') === 'true';
    }
    return false;
  });
  
  // Wrapper to persist state on desktop
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      // Only persist on desktop
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        localStorage.setItem('bm-widget-open', String(newValue));
      }
      return newValue;
    });
  };
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    return sessionStorage.getItem('bm-welcome-dismissed') === 'true';
  });
  const [view, setViewState] = useState<View>(() => {
    // Only restore view on desktop (> 768px)
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      const saved = localStorage.getItem('bm-widget-view');
      // Only restore 'home', 'chat', and 'history' - contact/booking should reset to home
      if (saved && ['home', 'chat', 'history'].includes(saved)) {
        return saved as View;
      }
    }
    return 'home';
  });
  const [viewDirection, setViewDirection] = useState<'left' | 'right' | 'none'>('none');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Wrapper to persist view on desktop
  const setView = (newView: View) => {
    setViewState(newView);
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      localStorage.setItem('bm-widget-view', newView);
    }
  };
  
  const [contactSuccess, setContactSuccess] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittedNewsletterIds, setSubmittedNewsletterIds] = useState<Set<string>>(() => {
    const saved = sessionStorage.getItem('bm-newsletter-submitted-ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Custom setView with direction
  const navigateTo = (newView: View, direction: 'left' | 'right') => {
    setViewDirection(direction);
    setView(newView);
  };
  
  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('bm-user-email') || '';
  });
  const [emailError, setEmailError] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Empty is ok (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setUserEmail(value);
    // Save to localStorage for future sessions
    if (value.trim()) {
      localStorage.setItem('bm-user-email', value.trim());
    }
    // Clear error when user is typing
    if (emailError) setEmailError('');
  };
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  // Session state
  const [currentSessionId, setCurrentSessionIdState] = useState<string>(() => {
    // Restore session ID on desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      return localStorage.getItem('bm-current-session-id') || '';
    }
    return '';
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Wrapper to persist currentSessionId on desktop
  const setCurrentSessionId = (value: string) => {
    setCurrentSessionIdState(value);
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      if (value) {
        localStorage.setItem('bm-current-session-id', value);
      } else {
        localStorage.removeItem('bm-current-session-id');
      }
    }
  };
  
  // Health check
  const [isHealthy, setIsHealthy] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingMessageIndex = useRef(0);

  // iOS keyboard detection using visualViewport API
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const windowHeight = window.innerHeight;
        const viewportHeight = window.visualViewport.height;
        const keyboardH = windowHeight - viewportHeight;
        
        // Only set if keyboard is actually visible (> 100px difference)
        if (keyboardH > 100) {
          setKeyboardHeight(keyboardH);
          // Scroll input into view
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            setTimeout(() => {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    // Fallback for older browsers - detect focus on inputs
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // On iOS, when keyboard opens, we need to adjust
        setTimeout(() => {
          if (window.visualViewport) {
            handleResize();
          }
        }, 300);
      }
    };

    const handleFocusOut = () => {
      // Small delay to let viewport settle
      setTimeout(() => {
        setKeyboardHeight(0);
      }, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Health check on mount and every 10 minutes
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(WIDGET_CONFIG.healthCheckUrl, { method: 'GET' });
        setIsHealthy(response.ok);
      } catch {
        setIsHealthy(false);
      }
    };
    
    // Initial check
    checkHealth();
    
    // Periodic check every 10 minutes (600000ms)
    const intervalId = setInterval(checkHealth, 600000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Load sessions from localStorage and restore current session if on desktop
  useEffect(() => {
    const saved = localStorage.getItem(`bm_sessions_${WIDGET_CONFIG.tableName}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedSessions = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(loadedSessions);
        
        // On desktop, restore the current session's messages if we have a saved session ID
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
          const savedSessionId = localStorage.getItem('bm-current-session-id');
          const savedView = localStorage.getItem('bm-widget-view');
          
          if (savedSessionId && savedView === 'chat') {
            const session = loadedSessions.find((s: Session) => s.id === savedSessionId);
            if (session) {
              setMessages(session.messages);
            } else {
              // Session not found, reset to home
              setView('home');
              setCurrentSessionId('');
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(
        `bm_sessions_${WIDGET_CONFIG.tableName}`,
        JSON.stringify(sessions)
      );
    }
  }, [sessions]);

  // Show welcome bubble after delay
  useEffect(() => {
    if (!isOpen && !welcomeDismissed && isHealthy) {
      const timer = setTimeout(() => setShowWelcome(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, welcomeDismissed, isHealthy]);

  // Lock body scroll and disable zoom when widget is open on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 480;
    
    if (isOpen && isMobile) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock the body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Disable zoom on mobile
      const existingViewport = document.querySelector('meta[name="viewport"]');
      const originalContent = existingViewport?.getAttribute('content') || '';
      if (existingViewport) {
        existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      return () => {
        // Unlock the body
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        
        // Restore original viewport
        if (existingViewport && originalContent) {
          existingViewport.setAttribute('content', originalContent);
        }
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Scroll to bottom when chat view opens or widget opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [isOpen, view]);

  // Rotate typing messages
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        typingMessageIndex.current = (typingMessageIndex.current + 1) % WIDGET_CONFIG.typingMessages.length;
        setTypingMessage(WIDGET_CONFIG.typingMessages[typingMessageIndex.current]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  const startNewSession = useCallback(() => {
    const sessionId = generateSessionId();
    setCurrentSessionId(sessionId);
    setMessages([]);
    setView('home');
    setUserName('');
    // Keep email from localStorage
    setUserEmail(localStorage.getItem('bm-user-email') || '');
    setInitialMessage('');
    setSubmittedNewsletterIds(new Set());
    sessionStorage.removeItem('bm-newsletter-submitted-ids');
  }, []);

  const loadSession = useCallback((session: Session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setView('chat');
  }, []);

  const saveCurrentSession = useCallback(() => {
    if (messages.length === 0 || !currentSessionId) return;
    
    const firstUserMessage = messages.find(m => m.role === 'user');
    const preview = firstUserMessage?.content.slice(0, 50) || 'Nov pogovor';
    
    setSessions(prev => {
      const session: Session = {
        id: currentSessionId,
        messages,
        createdAt: new Date(), // Always update timestamp to current time
        preview
      };
      
      // Remove existing session if present, then add to top
      const filtered = prev.filter(s => s.id !== currentSessionId);
      return [session, ...filtered];
    });
  }, [messages, currentSessionId]);

  // Save session when messages change
  useEffect(() => {
    saveCurrentSession();
  }, [messages, saveCurrentSession]);

  // Helper: Extract output from various JSON formats
  const extractOutputFromResponse = (data: any): string => {
    // Array format: [{"output": "..."}]
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      if (item.output) return item.output;
      if (item.response) return item.response;
      if (item.message) return item.message;
      if (item.text) return item.text;
      if (item.content) return item.content;
    }
    
    // Object format: {"output": "..."}
    if (data && typeof data === 'object') {
      if (data.output) return data.output;
      if (data.response) return data.response;
      if (data.message) return data.message;
      if (data.text) return data.text;
      if (data.content) return data.content;
      // Nested: {"data": {"output": "..."}}
      if (data.data) {
        if (data.data.output) return data.data.output;
        if (data.data.response) return data.data.response;
      }
    }
    
    return typeof data === 'string' ? data : JSON.stringify(data);
  };

  // Simple non-streaming webhook function
  const sendMessageToWebhook = async (
    webhookUrl: string,
    sessionId: string,
    message: string
  ): Promise<{ output: string; sessionId: string }> => {
    const TIMEOUT_MS = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          chatInput: message
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        const output = extractOutputFromResponse(data);
        return { output, sessionId };
      } catch (_) {
        // Not JSON, return as plain text
        if (text.trim()) {
          return { output: text.trim(), sessionId };
        }
        throw new Error('Invalid server response');
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw new Error('Connection failed');
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTypingMessage(WIDGET_CONFIG.typingMessages[0]);

    const botMessageId = (Date.now() + 1).toString();

    try {
      const result = await sendMessageToWebhook(
        WIDGET_CONFIG.webhookUrl,
        currentSessionId,
        content.trim()
      );

      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'bot',
        content: result.output,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'bot',
        content: 'Oprostite, prišlo je do napake. Poskusite znova.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartConversation = async () => {
    if (!initialMessage.trim()) return;
    
    // Validate email if provided
    if (userEmail && !validateEmail(userEmail)) {
      setEmailError('Prosim vnesite veljaven email naslov');
      return;
    }
    setEmailError('');
    
    // Generate session ID if needed
    const sessionId = currentSessionId || generateSessionId();
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    
    // Send lead data
    if (userName || userEmail) {
      try {
        await fetch(WIDGET_CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            name: userName,
            email: userEmail,
            tableName: WIDGET_CONFIG.tableName
          })
        });
      } catch (error) {
        console.error('Lead webhook error:', error);
      }
    }
    
    navigateTo('chat', 'left');
    await sendMessage(initialMessage);
    setInitialMessage('');
  };

  const handleQuickQuestion = async (question: string) => {
    // Validate email if provided
    if (userEmail && !validateEmail(userEmail)) {
      setEmailError('Prosim vnesite veljaven email naslov');
      return;
    }
    setEmailError('');
    
    // Generate session ID if needed
    const sessionId = currentSessionId || generateSessionId();
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    
    // Send lead data if available
    if (userName || userEmail) {
      try {
        await fetch(WIDGET_CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            name: userName,
            email: userEmail,
            tableName: WIDGET_CONFIG.tableName
          })
        });
      } catch (error) {
        console.error('Lead webhook error:', error);
      }
    }
    
    navigateTo('chat', 'left');
    await sendMessage(question);
    setInitialMessage('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowWelcome(false);
    setWelcomeDismissed(true);
    sessionStorage.setItem('bm-welcome-dismissed', 'true');
    if (!currentSessionId) {
      startNewSession();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setViewDirection('none');
    // Welcome bubble stays dismissed after widget was opened
  };

  if (!isHealthy) {
    return null;
  }

  return (
    <div 
      className={`bm-widget-container ${isOpen ? 'widget-open' : ''} ${keyboardHeight > 0 ? 'keyboard-open' : ''}`}
      style={{ '--keyboard-height': `${keyboardHeight}px` } as React.CSSProperties}
    >
      {/* Welcome Bubble */}
      {showWelcome && !isOpen && (
        <div className="bm-welcome-bubble" onClick={handleOpen}>
          <p>{WIDGET_CONFIG.welcomeMessage}</p>
          {/* Hide close button on mobile - bubble click opens widget directly */}
          {window.innerWidth > 480 && (
            <button 
              className="bm-welcome-close" 
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcome(false);
                setWelcomeDismissed(true);
                sessionStorage.setItem('bm-welcome-dismissed', 'true');
              }}
            >
              <Icons.Close />
            </button>
          )}
        </div>
      )}

      {/* Trigger Button - Floating Style */}
      {WIDGET_CONFIG.triggerStyle === 'floating' && (
        <button 
          className={`bm-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => isOpen ? handleClose() : handleOpen()}
        >
          {isOpen ? (
            <Icons.Close />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={WIDGET_CONFIG.triggerIcon} />
            </svg>
          )}
          <span className="bm-trigger-dot"></span>
        </button>
      )}

      {/* Trigger Button - Edge Style */}
      {WIDGET_CONFIG.triggerStyle === 'edge' && (
        <button 
          className={`bm-trigger-edge ${isOpen ? 'open' : ''}`}
          onClick={() => isOpen ? handleClose() : handleOpen()}
        >
          <span>{WIDGET_CONFIG.edgeTriggerText}</span>
        </button>
      )}

      {/* Widget */}
      {isOpen && (
        <div className="bm-widget">
          {view === 'home' && (
            <div className={`bm-view-enter-${viewDirection} bm-home-view`}>
              {/* Header with gradient */}
              <div className="bm-header-home">
                <div className="bm-header-home-actions">
                  <button 
                    className="bm-history-btn"
                    onClick={() => navigateTo('history', 'left')}
                    title="Zgodovina"
                  >
                    <Icons.History />
                  </button>
                  <button 
                    className="bm-close-btn-home"
                    onClick={handleClose}
                    title="Zapri"
                  >
                    <Icons.Close />
                  </button>
                </div>
                <div className="bm-monitor-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {WIDGET_CONFIG.botIcon.map((path, i) => <path key={i} d={path} />)}
                  </svg>
                </div>
                <h2>
                  <span>{WIDGET_CONFIG.homeTitle}</span>
                  <span>{WIDGET_CONFIG.homeSubtitleLine2}</span>
                </h2>
              </div>

              {/* Quick Questions */}
              <div className="bm-quick-section">
                <div className="bm-quick-label">Pogosta vprašanja</div>
                <div className="bm-quick-questions">
                  {WIDGET_CONFIG.quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="bm-quick-btn"
                      onMouseEnter={() => setInitialMessage(question)}
                      onMouseLeave={() => setInitialMessage('')}
                      onClick={() => {
                        setInitialMessage(question);
                        handleQuickQuestion(question);
                      }}
                    >
                      <div className="bm-quick-btn-content">
                        <div className="bm-quick-btn-dot" />
                        <span>{question}</span>
                      </div>
                      <Icons.ChevronRight />
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Section - Email + Message Input (fixed together) */}
              <div className="bm-bottom-section">
                {/* Input Stack - Email */}
              {WIDGET_CONFIG.showEmailField && (
                  <div className="bm-input-stack">
                    <input
                      type="email"
                      className={`bm-input-full ${emailError ? 'error' : ''}`}
                      placeholder="Email (opcijsko)"
                      value={userEmail}
                      onChange={e => handleEmailChange(e.target.value)}
                    />
                    {emailError && <div className="bm-email-error bm-hide-on-mobile">{emailError}</div>}
                  </div>
                )}

                {/* Message Input */}
                <div className="bm-message-input-area">
                  <div className={`bm-message-input-wrapper ${initialMessage.trim() ? 'has-text' : ''}`}>
                    <textarea
                      placeholder={WIDGET_CONFIG.messagePlaceholder}
                      value={initialMessage}
                      onChange={e => {
                        setInitialMessage(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && initialMessage.trim()) {
                          e.preventDefault();
                          handleStartConversation();
                        }
                      }}
                      rows={1}
                    />
                    <button 
                      className="bm-send-btn-home"
                      onClick={handleStartConversation}
                      disabled={!initialMessage.trim()}
                    >
                      <Icons.ArrowUp />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bm-footer">
                <span>{WIDGET_CONFIG.footerPrefix}</span>
                <a href={WIDGET_CONFIG.footerLinkUrl} target="_blank" rel="noopener noreferrer">{WIDGET_CONFIG.footerLinkText}</a>
                <span>{WIDGET_CONFIG.footerSuffix}</span>
              </div>
            </div>
          )}

          {view === 'chat' && (
            <div className={`bm-view-enter-${viewDirection}`}>
              <div className="bm-header-chat">
                <button className="bm-back-btn" onClick={() => {
                  // Save current session and start fresh for next conversation
                  saveCurrentSession();
                  setCurrentSessionId(generateSessionId());
                  setMessages([]);
                  setSubmittedNewsletterIds(new Set());
                  sessionStorage.removeItem('bm-newsletter-submitted-ids');
                  navigateTo('home', 'right');
                }}>
                  <Icons.Back />
                </button>
                <div className="bm-avatar-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {WIDGET_CONFIG.botIcon.map((path, i) => <path key={i} d={path} />)}
                  </svg>
                </div>
                <div className="bm-header-info">
                  <h3>{WIDGET_CONFIG.botName}</h3>
                  <span className="bm-online-status">
                    <span className="bm-online-dot"></span>
                    Online
                  </span>
                </div>
                <button className="bm-close-btn" onClick={handleClose}>
                  <Icons.Close />
                </button>
              </div>
              <div className="bm-content">
                <div className="bm-messages">
                  {messages.map(msg => (
                    <div key={msg.id} className={`bm-message ${msg.role}`}>
                      {msg.role === 'bot' && <Avatar small />}
                      <div className="bm-message-content">
                        <div className="bm-bubble">
                          <MessageContent
                            content={msg.content}
                            onContactClick={() => navigateTo('contact', 'right')}
                            onBookingClick={() => navigateTo('booking', 'right')}
                            sessionId={currentSessionId}
                            messageId={msg.id}
                            submittedNewsletterIds={submittedNewsletterIds}
                            onNewsletterSuccess={(msgId) => {
                              const newSet = new Set(submittedNewsletterIds);
                              newSet.add(msgId);
                              setSubmittedNewsletterIds(newSet);
                              sessionStorage.setItem('bm-newsletter-submitted-ids', JSON.stringify([...newSet]));
                              setTimeout(() => {
                                setMessages(prev => [...prev, {
                                  id: Date.now().toString(),
                                  role: 'bot',
                                  content: 'Hvala! Zdaj boste med prvimi izvedeli za vse novosti. 😊',
                                  timestamp: new Date()
                                }]);
                              }, 500);
                            }}
                          />
                        </div>
                        <div className="bm-timestamp">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bm-typing">
                      <Avatar small />
                      <div className="bm-typing-content">
                        <div className="bm-typing-dots">
                          <div className="bm-typing-dot" />
                          <div className="bm-typing-dot" />
                          <div className="bm-typing-dot" />
                        </div>
                        <div className="bm-typing-status">{typingMessage}</div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="bm-input-area">
                <textarea
                  id="bm-chat-textarea"
                  className="bm-chat-input"
                  placeholder={WIDGET_CONFIG.messagePlaceholder}
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    // Auto-resize textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 64) + 'px';
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                      // Reset textarea height
                      e.currentTarget.style.height = '44px';
                    }
                  }}
                  disabled={isTyping}
                  rows={1}
                />
                <button 
                  className="bm-send-btn"
                  onClick={() => {
                    sendMessage(inputValue);
                    // Reset textarea height
                    const textarea = document.getElementById('bm-chat-textarea') as HTMLTextAreaElement;
                    if (textarea) textarea.style.height = '44px';
                  }}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Icons.Send />
                </button>
              </div>
              <div className="bm-footer">
                <span>{WIDGET_CONFIG.footerPrefix}</span>
                <a href={WIDGET_CONFIG.footerLinkUrl} target="_blank" rel="noopener noreferrer">{WIDGET_CONFIG.footerLinkText}</a>
                <span>{WIDGET_CONFIG.footerSuffix}</span>
              </div>
            </div>
          )}

          {view === 'contact' && (
            <div className={`bm-view-enter-${viewDirection}`}>
              <div className="bm-header-chat">
                {!contactSuccess && (
                  <button className="bm-back-btn" onClick={() => navigateTo('chat', 'left')}>
                    <Icons.Back />
                  </button>
                )}
                <div className="bm-header-info" style={{ textAlign: 'center', flex: 1 }}>
                  <h3 style={{ fontSize: '18px' }}>{contactSuccess ? 'Sporočilo poslano!' : 'Kontaktiraj nas'}</h3>
                </div>
                {!contactSuccess && <div style={{ width: '32px' }}></div>}
              </div>
              <ContactForm 
                onClose={() => {
                  setContactSuccess(false);
                  navigateTo('chat', 'left');
                  // Add follow-up bot message after returning to chat
                  setTimeout(() => {
                    setMessages(prev => [...prev, {
                      id: Date.now().toString(),
                      role: 'bot',
                      content: 'Support ticket uspešno ustvarjen! ✅\nPotrditev ste prejeli na vaš email. 😊',
                      timestamp: new Date()
                    }]);
                  }, 300);
                }} 
                chatHistory={messages}
                onSuccess={() => setContactSuccess(true)}
                sessionId={currentSessionId}
              />
            </div>
          )}

          {view === 'history' && (
            <div className={`bm-view-enter-${viewDirection}`}>
              <div className="bm-header-chat">
                <button className="bm-back-btn" onClick={() => navigateTo('home', 'right')}>
                  <Icons.Back />
                </button>
                <div className="bm-header-info" style={{ textAlign: 'center', flex: 1 }}>
                  <h3 style={{ fontSize: '18px' }}>Moji pogovori</h3>
                </div>
                <button className="bm-close-btn" onClick={handleClose}>
                  <Icons.Close />
                </button>
              </div>
              <div className="bm-content">
                {sessions.length === 0 ? (
                  <div className="bm-empty">
                    <h4>Ni preteklih pogovorov</h4>
                    <p>Vaši pogovori bodo shranjeni tukaj.</p>
                  </div>
                ) : (
                  <div className="bm-history-list">
                    {sessions.map(session => {
                      const firstUserMsg = session.messages.find(m => m.role === 'user');
                      const firstBotMsg = session.messages.find(m => m.role === 'bot');
                      const dateStr = session.createdAt.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' }).toUpperCase().replace('.', '');
                      
                      return (
                        <div 
                          key={session.id} 
                          className="bm-history-item"
                          onClick={() => loadSession(session)}
                        >
                          <div className="bm-history-icon">
                            <Icons.MessageSquare />
                          </div>
                          <div className="bm-history-content">
                            <h4>{firstUserMsg?.content.slice(0, 40) || 'Nov pogovor'}{(firstUserMsg?.content.length || 0) > 40 ? '...' : ''}</h4>
                            <p>{firstBotMsg?.content.slice(0, 45) || 'Brez odgovora'}{(firstBotMsg?.content.length || 0) > 45 ? '...' : ''}</p>
                          </div>
                          <div className="bm-history-meta">
                            <span className="bm-history-date">{dateStr}</span>
                            <div className="bm-history-arrow">
                              <Icons.ChevronRight />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bm-history-footer">
                <button 
                  className="bm-submit-btn bm-new-chat-btn"
                  onClick={startNewSession}
                >
                  Nov pogovor
                </button>
              </div>
              <div className="bm-footer">
                <span>{WIDGET_CONFIG.footerPrefix}</span>
                <a href={WIDGET_CONFIG.footerLinkUrl} target="_blank" rel="noopener noreferrer">{WIDGET_CONFIG.footerLinkText}</a>
                <span>{WIDGET_CONFIG.footerSuffix}</span>
              </div>
            </div>
          )}

          {view === 'booking' && (
            <div className={`bm-view-enter-${viewDirection}`}>
              <div className="bm-header-chat">
                {!bookingSuccess && (
                  <button className="bm-back-btn" onClick={() => navigateTo('chat', 'left')}>
                    <Icons.Back />
                  </button>
                )}
                <div className="bm-header-info" style={{ textAlign: 'center', flex: 1 }}>
                  <h3 style={{ fontSize: '18px' }}>{bookingSuccess ? 'Termin rezerviran!' : 'Rezerviraj termin'}</h3>
                </div>
                {!bookingSuccess && <div style={{ width: '32px' }}></div>}
              </div>
              <BookingView 
                showSuccess={bookingSuccess}
                onClose={() => {
                  setBookingSuccess(false);
                  navigateTo('chat', 'left');
                }} 
                onSuccess={() => {
                  setBookingSuccess(true);
                  // After 3 seconds, go back to chat and add message
                  setTimeout(() => {
                    setBookingSuccess(false);
                    navigateTo('chat', 'left');
                    setTimeout(() => {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'bot',
                        content: 'Termin je uspešno rezerviran! ✅\nPotrditev ste prejeli na vaš email. 😊',
                        timestamp: new Date()
                      }]);
                    }, 300);
                  }, 3000);
                }}
              />
              <div className="bm-footer">
                <span>{WIDGET_CONFIG.footerPrefix}</span>
                <a href={WIDGET_CONFIG.footerLinkUrl} target="_blank" rel="noopener noreferrer">{WIDGET_CONFIG.footerLinkText}</a>
                <span>{WIDGET_CONFIG.footerSuffix}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AUTO-INIT
// ============================================================================

function injectStyles() {
  const existing = document.getElementById('bm-widget-styles') as HTMLStyleElement | null;
  if (existing) {
    // Always refresh styles so published/embedded versions can't get stuck with old CSS.
    existing.textContent = WIDGET_STYLES;
    return;
  }
  const style = document.createElement('style');
  style.id = 'bm-widget-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}

function initWidget() {
  injectStyles();
  
  let container = document.getElementById('bm-chat-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'bm-chat-widget';
    document.body.appendChild(container);
  }
  
  const root = createRoot(container);
  root.render(<ChatWidget />);
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

export default ChatWidget;
export { WIDGET_CONFIG, initWidget };
