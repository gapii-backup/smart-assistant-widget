import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WIDGET_CONFIG = {
  // Display
  mode: 'dark' as 'light' | 'dark',
  position: 'right' as 'left' | 'right',
  
  // Colors
  primaryColor: '#3B82F6',
  
  // Branding  
  botName: 'AI Asistent',
  botAvatar: '',
  
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
  showNameField: false,
  showEmailField: true,
  
  // Webhooks  
  webhookUrl: 'https://hub.botmotion.ai/webhook/051e33f1-1f96-4722-af95-a28f2f3afd01/chat',
  leadWebhookUrl: 'https://hub.botmotion.ai/webhook/lead',
  supportWebhookUrl: 'https://hub.botmotion.ai/webhook/support',
  healthCheckUrl: 'https://hub.botmotion.ai/webhook/health-check',
  
  // Booking
  bookingEnabled: true,
  bookingUrl: 'https://cal.com/gasper-perko-i5tznd/15min',
  
  // Footer
  showFooter: true,
  poweredByName: 'BotMotion',
  poweredByUrl: 'https://botmotion.ai',
  
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
    bottom: 24px;
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
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
    position: relative;
  }

  .bm-trigger:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(59, 130, 246, 0.5);
  }

  .bm-trigger svg {
    width: 28px;
    height: 28px;
    color: white;
    transition: transform 0.2s ease;
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

  /* Welcome Bubble */
  .bm-welcome-bubble {
    position: absolute;
    bottom: 72px;
    ${WIDGET_CONFIG.position}: 0;
    background: var(--bm-primary);
    border: none;
    border-radius: 20px;
    padding: 14px 20px;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
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
    bottom: 72px;
    ${WIDGET_CONFIG.position}: 0;
    width: 420px;
    height: 716px;
    background: var(--bm-bg);
    border-radius: 16px;
    box-shadow: var(--bm-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: bm-slide-up 0.25s ease;
    border: 1px solid var(--bm-border);
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

  /* Header - Home */
  .bm-header-home {
    background: linear-gradient(180deg, ${adjustColor(WIDGET_CONFIG.primaryColor, -30)} 0%, var(--bm-bg) 100%);
    padding: 16px 20px 32px;
    text-align: center;
    flex-shrink: 0;
    position: relative;
  }

  .bm-header-home-actions {
    position: absolute;
    top: 16px;
    right: 16px;
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
    background: var(--bm-primary);
    margin: 16px auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }

  .bm-monitor-icon svg {
    width: 32px;
    height: 32px;
    color: white;
  }

  .bm-header-home h2 {
    color: white;
    font-size: 26px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }

  .bm-header-home h2 span {
    display: block;
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
    background: white;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    color: var(--bm-primary);
  }

  .bm-avatar-small {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border-radius: 50%;
    background: var(--bm-bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .bm-avatar-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .bm-avatar-small svg {
    width: 14px;
    height: 14px;
    color: var(--bm-primary);
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
  }


  .bm-quick-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--bm-text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
    text-align: center;
  }

  .bm-quick-questions {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    background: var(--bm-bg);
  }

  /* Input Stack */
  .bm-input-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 20px 8px;
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  .bm-input-full::placeholder {
    color: var(--bm-text-muted);
  }

  /* Message Input Area */
  .bm-message-input-area {
    padding: 8px 20px 8px;
    background: var(--bm-bg);
  }

  .bm-message-input-wrapper {
    display: flex;
    align-items: center;
    background: var(--bm-bg-secondary);
    border: 2px solid var(--bm-border);
    border-radius: 24px;
    padding: 6px 6px 6px 20px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .bm-message-input-wrapper:focus-within {
    border-color: var(--bm-primary);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
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
  }

  .bm-message-input-wrapper textarea::placeholder {
    color: var(--bm-text-muted);
  }

  .bm-message-input-wrapper textarea::-webkit-scrollbar {
    width: 4px;
  }

  .bm-message-input-wrapper textarea::-webkit-scrollbar-thumb {
    background: var(--bm-border);
    border-radius: 2px;
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
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }

  .bm-send-btn-home:hover {
    background: var(--bm-primary-hover);
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
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
    margin-bottom: 16px;
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
    font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .bm-input:focus {
    outline: none;
    border-color: var(--bm-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  .bm-input::placeholder {
    color: var(--bm-text-muted);
  }

  .bm-textarea {
    min-height: 100px;
    resize: vertical;
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
    align-items: flex-start;
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
  }

  .bm-chat-input {
    flex: 1;
    padding: 12px 18px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 24px;
    color: var(--bm-text);
    font-size: 14px;
    transition: border-color 0.2s ease;
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
    color: ${adjustColor(WIDGET_CONFIG.primaryColor, 30)};
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
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

  /* Product Cards */
  .bm-products {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 10px 0;
    margin-top: 10px;
  }

  .bm-products::-webkit-scrollbar {
    height: 4px;
  }

  .bm-products::-webkit-scrollbar-thumb {
    background: var(--bm-border);
    border-radius: 2px;
  }

  .bm-product-card {
    flex-shrink: 0;
    width: 140px;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .bm-product-card:hover {
    border-color: var(--bm-primary);
    transform: translateY(-2px);
  }

  .bm-product-card img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }

  .bm-product-card h5 {
    padding: 10px;
    color: var(--bm-text);
    font-size: 12px;
    font-weight: 500;
    margin: 0;
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

  /* Responsive */
  @media (max-width: 480px) {
    .bm-widget {
      width: calc(100vw - 32px);
      height: calc(100vh - 100px);
      bottom: 80px;
      ${WIDGET_CONFIG.position}: 16px;
    }

    .bm-welcome-bubble {
      ${WIDGET_CONFIG.position}: 0;
      max-width: calc(100vw - 32px);
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

type View = 'home' | 'chat' | 'history';
type ModalType = 'contact' | 'booking' | null;

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
      <Icons.Bot />
    </div>
  );
};

const ContactModal: React.FC<{
  onClose: () => void;
  chatHistory: Message[];
}> = ({ onClose, chatHistory }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(WIDGET_CONFIG.supportWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          chatHistory: chatHistory.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          })),
          tableName: WIDGET_CONFIG.tableName
        })
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-modal-header">
          <h3>Kontaktiraj nas</h3>
          <button className="bm-modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>
        <div className="bm-modal-content">
          {success ? (
            <div className="bm-empty">
              <Icons.Mail />
              <h4>Sporočilo poslano!</h4>
              <p>Hvala za vaše sporočilo. Odgovorili vam bomo v najkrajšem možnem času.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bm-form-group">
                <label>Ime</label>
                <input
                  type="text"
                  className="bm-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="bm-form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="bm-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="bm-form-group">
                <label>Sporočilo</label>
                <textarea
                  className="bm-input bm-textarea"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="bm-submit-btn" disabled={loading}>
                {loading ? 'Pošiljam...' : 'Pošlji sporočilo'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-modal-header">
          <h3>Rezerviraj termin</h3>
          <button className="bm-modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>
        <div className="bm-modal-content">
          <iframe src={WIDGET_CONFIG.bookingUrl} title="Booking" />
        </div>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{
  content: string;
  onContactClick: () => void;
  onBookingClick: () => void;
}> = ({ content, onContactClick, onBookingClick }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = async () => {
    try {
      await fetch(WIDGET_CONFIG.leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          type: 'newsletter',
          tableName: WIDGET_CONFIG.tableName
        })
      });
      setNewsletterSubmitted(true);
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  };

  // Parse special markers
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // Contact form
  if (remaining.includes('[CONTACT_FORM]')) {
    const [before, after] = remaining.split('[CONTACT_FORM]');
    if (before) parts.push(<span key={key++}>{before}</span>);
    parts.push(
      <button key={key++} className="bm-action-btn" onClick={onContactClick}>
        <Icons.Mail />
        Kontaktiraj nas
      </button>
    );
    remaining = after || '';
  }

  // Booking
  if (remaining.includes('[BOOKING]') && WIDGET_CONFIG.bookingEnabled) {
    const [before, after] = remaining.split('[BOOKING]');
    if (before) parts.push(<span key={key++}>{before}</span>);
    parts.push(
      <button key={key++} className="bm-action-btn" onClick={onBookingClick}>
        <Icons.Calendar />
        Rezerviraj termin
      </button>
    );
    remaining = after || '';
  }

  // Newsletter
  if (remaining.includes('[NEWSLETTER]')) {
    const [before, after] = remaining.split('[NEWSLETTER]');
    if (before) parts.push(<span key={key++}>{before}</span>);
    parts.push(
      <div key={key++} className="bm-newsletter">
        {newsletterSubmitted ? (
          <span style={{ color: 'var(--bm-primary)' }}>Hvala za prijavo!</span>
        ) : (
          <>
            <input
              type="email"
              placeholder="Vaš email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
            />
            <button onClick={handleNewsletterSubmit}>Prijava</button>
          </>
        )}
      </div>
    );
    remaining = after || '';
  }

  // Product cards
  const productMatch = remaining.match(/\[PRODUCT_CARDS\](.*?)\[\/PRODUCT_CARDS\]/s);
  if (productMatch) {
    const [before] = remaining.split('[PRODUCT_CARDS]');
    const afterProducts = remaining.split('[/PRODUCT_CARDS]')[1] || '';
    
    if (before) parts.push(<span key={key++}>{before}</span>);
    
    try {
      const products = JSON.parse(productMatch[1]);
      parts.push(
        <div key={key++} className="bm-products">
          {products.map((product: any, i: number) => (
            <a
              key={i}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bm-product-card"
            >
              {product.image && <img src={product.image} alt={product.ime} />}
              <h5>{product.ime}</h5>
            </a>
          ))}
        </div>
      );
    } catch (e) {
      console.error('Product cards parse error:', e);
    }
    
    remaining = afterProducts;
  }

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
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    return sessionStorage.getItem('bm-welcome-dismissed') === 'true';
  });
  const [view, setView] = useState<View>('home');
  const [viewDirection, setViewDirection] = useState<'left' | 'right' | 'none'>('none');
  const [modal, setModal] = useState<ModalType>(null);

  // Custom setView with direction
  const navigateTo = (newView: View, direction: 'left' | 'right') => {
    setViewDirection(direction);
    setView(newView);
  };
  
  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
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
    // Clear error when user is typing
    if (emailError) setEmailError('');
  };
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Health check
  const [isHealthy, setIsHealthy] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingMessageIndex = useRef(0);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(WIDGET_CONFIG.healthCheckUrl, { method: 'GET' });
        setIsHealthy(response.ok);
      } catch {
        setIsHealthy(false);
      }
    };
    checkHealth();
  }, []);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`bm_sessions_${WIDGET_CONFIG.tableName}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
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
    setUserEmail('');
    setInitialMessage('');
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
    
    // Send lead data
    if (userName || userEmail) {
      try {
        await fetch(WIDGET_CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            tableName: WIDGET_CONFIG.tableName
          })
        });
      } catch (error) {
        console.error('Lead webhook error:', error);
      }
    }

    if (!currentSessionId) {
      setCurrentSessionId(generateSessionId());
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
    
    // Send lead data if available
    if (userName || userEmail) {
      try {
        await fetch(WIDGET_CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            tableName: WIDGET_CONFIG.tableName
          })
        });
      } catch (error) {
        console.error('Lead webhook error:', error);
      }
    }

    if (!currentSessionId) {
      setCurrentSessionId(generateSessionId());
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
    <div className="bm-widget-container">
      {/* Welcome Bubble */}
      {showWelcome && !isOpen && (
        <div className="bm-welcome-bubble" onClick={handleOpen}>
          <p>{WIDGET_CONFIG.welcomeMessage}</p>
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
        </div>
      )}

      {/* Trigger Button */}
      <button 
        className={`bm-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => isOpen ? handleClose() : handleOpen()}
      >
        {isOpen ? <Icons.Close /> : <Icons.Chat />}
        <span className="bm-trigger-dot"></span>
      </button>

      {/* Widget */}
      {isOpen && (
        <div className="bm-widget">
          {view === 'home' && (
            <div className={`bm-view-enter-${viewDirection}`}>
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
                </div>
                <div className="bm-monitor-icon">
                  <Icons.Monitor />
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
                    {emailError && <div className="bm-email-error">{emailError}</div>}
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
              {WIDGET_CONFIG.showFooter && (
                <div className="bm-footer">
                  <span>⚡Powered by </span>
                  <a href="https://botmotion.ai" target="_blank" rel="noopener noreferrer">BotMotion.ai Slovenia</a>
                  <span>⚡</span>
                </div>
              )}
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
                  navigateTo('home', 'right');
                }}>
                  <Icons.Back />
                </button>
                <Avatar small />
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
                            onContactClick={() => setModal('contact')}
                            onBookingClick={() => setModal('booking')}
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
                <input
                  type="text"
                  className="bm-chat-input"
                  placeholder={WIDGET_CONFIG.messagePlaceholder}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                    }
                  }}
                  disabled={isTyping}
                />
                <button 
                  className="bm-send-btn"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Icons.Send />
                </button>
              </div>
              {WIDGET_CONFIG.showFooter && (
                <div className="bm-footer">
                  <span>⚡Powered by </span>
                  <a href="https://botmotion.ai" target="_blank" rel="noopener noreferrer">BotMotion.ai Slovenia</a>
                  <span>⚡</span>
                </div>
              )}
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
                    <Icons.MessageSquare />
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
              {WIDGET_CONFIG.showFooter && (
                <div className="bm-footer">
                  <span>⚡Powered by </span>
                  <a href="https://botmotion.ai" target="_blank" rel="noopener noreferrer">BotMotion.ai Slovenia</a>
                  <span>⚡</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'contact' && (
        <ContactModal 
          onClose={() => setModal(null)} 
          chatHistory={messages}
        />
      )}
      {modal === 'booking' && (
        <BookingModal onClose={() => setModal(null)} />
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
