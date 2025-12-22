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
  homeTitle: 'Pozdravljeni 👋',
  homeSubtitle: 'Kako vam lahko pomagamo?',
  welcomeMessage: '👋 Pozdravljeni! Kako vam lahko pomagam?',
  messagePlaceholder: 'Vnesite sporočilo...',
  
  // Fields
  showNameField: true,
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
    'Iščem najboljši odgovor...',
    'Skoraj pripravljen...',
    'Še trenutek...'
  ],
  
  // Suggestion buttons (shown when widget is closed)
  suggestionButtons: [
    'Kako deluje vaša storitev?',
    'Koliko stane?'
  ],
  
  // Timeout
  timeoutMs: 120000 // 2 minutes
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

  /* Suggestion Buttons */
  .bm-suggestions {
    position: absolute;
    bottom: 72px;
    ${WIDGET_CONFIG.position}: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: bm-fade-in 0.5s ease;
  }

  .bm-suggestion-btn {
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    padding: 16px 20px;
    border-radius: 16px;
    box-shadow: var(--bm-shadow);
    cursor: pointer;
    font-size: 14px;
    color: var(--bm-text);
    max-width: 300px;
    text-align: left;
    transition: all 0.2s;
  }

  .bm-suggestion-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-color: var(--bm-primary);
  }

  /* Welcome Bubble */
  .bm-welcome-bubble {
    position: absolute;
    bottom: 72px;
    ${WIDGET_CONFIG.position}: 0;
    background: linear-gradient(135deg, var(--bm-primary), ${adjustColor(WIDGET_CONFIG.primaryColor, 20)});
    border-radius: 20px 20px 4px 20px;
    padding: 16px 24px;
    box-shadow: var(--bm-shadow);
    max-width: 280px;
    cursor: pointer;
    animation: bm-bounce-in 0.6s ease;
  }

  @keyframes bm-bounce-in {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    60% {
      transform: translateY(-5px) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .bm-welcome-bubble:hover {
    transform: translateY(-3px) scale(1.02);
  }

  .bm-welcome-bubble p {
    color: white;
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    padding-right: 20px;
  }

  .bm-welcome-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border: 2px solid var(--bm-border);
    background: var(--bm-bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    opacity: 0;
  }

  .bm-welcome-bubble:hover .bm-welcome-close {
    opacity: 1;
  }

  .bm-welcome-close:hover {
    background: var(--bm-bg-secondary);
    transform: scale(1.1);
  }

  .bm-welcome-close svg {
    width: 12px;
    height: 12px;
    color: var(--bm-text-muted);
  }

  /* Main Widget */
  .bm-widget {
    position: absolute;
    bottom: 72px;
    ${WIDGET_CONFIG.position}: 0;
    width: 400px;
    height: 650px;
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

  /* Header */
  .bm-header {
    background: linear-gradient(135deg, var(--bm-primary), ${adjustColor(WIDGET_CONFIG.primaryColor, -20)});
    padding: 24px;
    text-align: center;
    flex-shrink: 0;
  }

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

  /* Markdown Styling */
  .bm-bubble strong {
    font-weight: 600;
  }

  .bm-bubble em {
    font-style: italic;
  }

  .bm-bubble ul, .bm-bubble ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  .bm-bubble li {
    margin: 4px 0;
  }

  .bm-bubble a {
    color: var(--bm-primary);
    text-decoration: underline;
  }

  .bm-bubble a:hover {
    opacity: 0.8;
  }

  /* System Message */
  .bm-message-system {
    display: flex;
    justify-content: center;
    margin: 16px 0;
  }

  .bm-message-system-bubble {
    background: rgba(239, 68, 68, 0.1);
    color: rgb(239, 68, 68);
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    max-width: 80%;
    text-align: center;
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
    gap: 4px;
  }

  .bm-typing-dots {
    display: flex;
    gap: 4px;
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border-radius: 18px;
    border-bottom-left-radius: 6px;
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
    animation: bm-fade-in 0.3s ease;
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
    padding: 10px;
    text-align: center;
    border-top: 1px solid var(--bm-border);
    flex-shrink: 0;
  }

  .bm-footer a {
    color: var(--bm-text-muted);
    font-size: 11px;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .bm-footer a:hover {
    color: var(--bm-primary);
  }

  /* History */
  .bm-history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bm-history-item {
    padding: 14px 16px;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bm-history-item:hover {
    border-color: var(--bm-primary);
  }

  .bm-history-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .bm-history-icon svg {
    width: 20px;
    height: 20px;
    color: var(--bm-primary);
  }

  .bm-history-content {
    flex: 1;
    min-width: 0;
  }

  .bm-history-item h4 {
    color: var(--bm-text);
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bm-history-item p {
    color: var(--bm-text-muted);
    font-size: 12px;
    margin: 0;
  }

  .bm-new-chat-btn {
    margin-top: 16px;
  }

  /* Action Buttons */
  .bm-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--bm-primary), ${adjustColor(WIDGET_CONFIG.primaryColor, 15)});
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }

  .bm-action-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .bm-action-btn svg {
    width: 16px;
    height: 16px;
  }

  .bm-action-btn.booking {
    background: linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 71%, 55%));
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  }

  .bm-action-btn.booking:hover {
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  /* Newsletter Form */
  .bm-newsletter {
    margin-top: 12px;
    padding: 16px;
    background: var(--bm-bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--bm-border);
  }

  .bm-newsletter-inner {
    display: flex;
    gap: 8px;
  }

  .bm-newsletter input {
    flex: 1;
    padding: 10px 14px;
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 8px;
    color: var(--bm-text);
    font-size: 14px;
  }

  .bm-newsletter input:focus {
    outline: none;
    border-color: var(--bm-primary);
  }

  .bm-newsletter button {
    padding: 10px 18px;
    background: var(--bm-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .bm-newsletter button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .bm-newsletter button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .bm-newsletter-dismiss {
    display: block;
    margin-top: 10px;
    background: none;
    border: none;
    color: var(--bm-text-muted);
    font-size: 13px;
    cursor: pointer;
    padding: 0;
  }

  .bm-newsletter-dismiss:hover {
    color: var(--bm-text);
  }

  .bm-newsletter-success {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    color: hsl(142, 50%, 40%);
    font-size: 14px;
    padding: 16px;
    text-align: center;
  }

  /* Product Cards */
  .bm-products {
    margin-top: 12px;
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .bm-products-carousel {
    display: flex;
    transition: transform 0.3s ease;
  }

  .bm-product-card {
    flex-shrink: 0;
    width: 100%;
    padding: 0 4px;
  }

  .bm-product-card-inner {
    background: var(--bm-bg);
    border: 1px solid var(--bm-border);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .bm-product-card-inner:hover {
    border-color: var(--bm-primary);
    transform: translateY(-2px);
  }

  .bm-product-card img {
    width: 100%;
    height: 140px;
    object-fit: cover;
  }

  .bm-product-card-body {
    padding: 12px;
  }

  .bm-product-card h5 {
    color: var(--bm-text);
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .bm-product-card p {
    color: var(--bm-text-muted);
    font-size: 12px;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .bm-product-card a {
    color: var(--bm-primary);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
  }

  .bm-product-card a:hover {
    text-decoration: underline;
  }

  .bm-products-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
  }

  .bm-products-nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bm-bg-secondary);
    border: 1px solid var(--bm-border);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .bm-products-nav-btn:hover:not(:disabled) {
    border-color: var(--bm-primary);
    background: var(--bm-bg);
  }

  .bm-products-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .bm-products-nav-btn svg {
    width: 16px;
    height: 16px;
    color: var(--bm-text-muted);
  }

  .bm-products-dots {
    display: flex;
    gap: 6px;
  }

  .bm-products-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bm-border);
    transition: background 0.2s;
  }

  .bm-products-dot.active {
    background: var(--bm-primary);
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
    background: linear-gradient(135deg, var(--bm-primary), ${adjustColor(WIDGET_CONFIG.primaryColor, -10)});
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .bm-modal-header.booking {
    background: linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 71%, 55%));
  }

  .bm-modal-header-content h3 {
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 2px;
  }

  .bm-modal-header-content p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    margin: 0;
  }

  .bm-modal-close {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .bm-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .bm-modal-close svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  .bm-modal-content {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(90vh - 80px);
  }

  /* Booking Modal - Fullscreen Style */
  .bm-modal.booking {
    max-width: 400px;
    max-height: 650px;
    width: 400px;
    height: 650px;
  }

  .bm-modal.booking .bm-modal-content {
    padding: 0;
    height: calc(100% - 60px);
    background: #1a1a1a;
  }

  .bm-modal.booking iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .bm-booking-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
  }

  .bm-booking-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: hsl(142, 71%, 45%);
    border-radius: 50%;
    animation: bm-spin 1s linear infinite;
  }

  @keyframes bm-spin {
    to { transform: rotate(360deg); }
  }

  .bm-booking-loading-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  /* Form Error */
  .bm-form-error {
    background: rgba(239, 68, 68, 0.1);
    color: rgb(239, 68, 68);
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
  }

  /* Success State */
  .bm-success {
    text-align: center;
    padding: 40px 24px;
  }

  .bm-success-icon {
    width: 64px;
    height: 64px;
    background: hsl(142, 71%, 45%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .bm-success-icon svg {
    width: 32px;
    height: 32px;
    color: white;
  }

  .bm-success h3 {
    color: var(--bm-text);
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px;
  }

  .bm-success p {
    color: var(--bm-text-muted);
    font-size: 14px;
    margin: 0;
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

    .bm-welcome-bubble,
    .bm-suggestions {
      ${WIDGET_CONFIG.position}: 0;
      max-width: calc(100vw - 100px);
    }

    .bm-modal.booking {
      width: calc(100vw - 32px);
      height: calc(100vh - 100px);
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

function formatTimestamp(timestamp: Date | number): string {
  const ts = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const now = Date.now();
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'sedaj';
  if (minutes < 60) return `pred ${minutes} min`;
  if (hours < 24) return `pred ${hours} h`;
  if (days === 1) return 'včeraj';
  if (days < 7) return `pred ${days} dni`;

  const date = new Date(ts);
  return date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// MARKDOWN PARSER
// ============================================================================

function parseMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Split by newlines to handle paragraphs and lists
  const lines = text.split('\n');
  let currentList: string[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = isOrderedList ? 'ol' : 'ul';
      elements.push(
        <ListTag key={key++}>
          {currentList.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ListTag>
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    // Unordered list
    const ulMatch = line.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      if (isOrderedList && currentList.length > 0) flushList();
      isOrderedList = false;
      currentList.push(ulMatch[1]);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (!isOrderedList && currentList.length > 0) flushList();
      isOrderedList = true;
      currentList.push(olMatch[1]);
      continue;
    }

    // Regular line
    flushList();
    if (line.trim()) {
      elements.push(<span key={key++}>{parseInlineMarkdown(line)}<br /></span>);
    } else {
      elements.push(<br key={key++} />);
    }
  }

  flushList();
  return elements;
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;
  let remaining = text;

  // Markdown link: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\s*\(?\s*(https?:\/\/[^\s\)]+)\)?/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseBasicMarkdown(text.substring(lastIndex, match.index), key));
      key += 10;
    }
    
    parts.push(
      <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) {
    // No markdown links found, check for plain URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    remaining = text;
    lastIndex = 0;
    
    while ((match = urlRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(...parseBasicMarkdown(text.substring(lastIndex, match.index), key));
        key += 10;
      }
      
      parts.push(
        <a key={key++} href={match[1]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(...parseBasicMarkdown(text.substring(lastIndex), key));
    }
  } else if (lastIndex < text.length) {
    parts.push(...parseBasicMarkdown(text.substring(lastIndex), key));
  }

  return parts.length > 0 ? parts : [text];
}

function parseBasicMarkdown(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = startKey;
  
  // Bold: **text** or __text__
  const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
    }
    parts.push(<strong key={key++}>{match[1] || match[2]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex === 0) {
    // No bold, check for italic
    const italicRegex = /\*(.+?)\*|_(.+?)_/g;
    
    while ((match = italicRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
      }
      parts.push(<em key={key++}>{match[1] || match[2]}</em>);
      lastIndex = match.index + match[0].length;
    }
  }
  
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? parts : [<span key={key}>{text}</span>];
}

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'bot' | 'system';
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  MessageSquare: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
};

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

interface WebhookResponse {
  output: string;
  sessionId: string;
}

async function sendMessageToWebhook(
  sessionId: string,
  message: string,
  onChunk?: (text: string) => void
): Promise<WebhookResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WIDGET_CONFIG.timeoutMs);

  try {
    const response = await fetch(WIDGET_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/x-ndjson, application/json, text/plain'
      },
      body: JSON.stringify({
        sessionId,
        chatInput: message
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Strežnik je vrnil napako (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Ni možno brati odgovora');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullOutput = '';
    let isStreamingDetected = false;
    let rawText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      rawText += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const evt = JSON.parse(trimmed);

          // Streaming NDJSON format: {"type": "item", "content": "..."}
          if (evt.type === 'item' && typeof evt.content === 'string') {
            isStreamingDetected = true;
            fullOutput += evt.content;
            onChunk?.(fullOutput);
          }

          if (evt.type === 'end') {
            isStreamingDetected = true;
            onChunk?.(fullOutput);
          }
        } catch {
          // Not valid JSON line
        }
      }
    }

    // Process remaining buffer
    const last = buffer.trim();
    if (last) {
      try {
        const evt = JSON.parse(last);
        if (evt.type === 'item' && typeof evt.content === 'string') {
          isStreamingDetected = true;
          fullOutput += evt.content;
          onChunk?.(fullOutput);
        }
      } catch {
        // Ignore
      }
    }

    // If streaming was detected and we have output, return it
    if (isStreamingDetected && fullOutput) {
      return { output: fullOutput, sessionId };
    }

    // Fallback: Try to parse entire response as JSON (non-streaming)
    try {
      const data = JSON.parse(rawText.trim());
      const output = extractOutputFromResponse(data);
      onChunk?.(output);
      return { output, sessionId };
    } catch {
      // If all else fails and we have raw text, use it
      if (rawText.trim()) {
        onChunk?.(rawText.trim());
        return { output: rawText.trim(), sessionId };
      }
      throw new Error('Neveljaven odgovor strežnika');
    }
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Strežnik se ne odziva, poskusite ponovno');
    }
    throw new Error(error.message || 'Povezava ni uspela, preverite internetno povezavo');
  }
}

function extractOutputFromResponse(data: any): string {
  // Array format: [{"output": "..."}]
  if (Array.isArray(data)) {
    if (data.length > 0) {
      const item = data[0];
      if (item.output) return item.output;
      if (item.response) return item.response;
      if (item.message) return item.message;
      if (item.text) return item.text;
      if (item.content) return item.content;
    }
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

  // Fallback
  return typeof data === 'string' ? data : JSON.stringify(data);
}

// ============================================================================
// MARKER DETECTION
// ============================================================================

function hasContactFormMarker(content: string): boolean {
  return content.includes('[CONTACT_FORM]');
}

function hasBookingMarker(content: string): boolean {
  return content.includes('[BOOKING]');
}

function hasNewsletterMarker(content: string): boolean {
  return content.includes('[NEWSLETTER]');
}

function hasProductCardsMarker(content: string): boolean {
  return content.includes('[PRODUCT_CARDS]') && content.includes('[/PRODUCT_CARDS]');
}

interface ProductCard {
  ime_izdelka?: string;
  kratek_opis?: string;
  url?: string;
  image_url?: string;
}

function extractProductCards(content: string): ProductCard[] {
  const match = content.match(/\[PRODUCT_CARDS\]([\s\S]*?)\[\/PRODUCT_CARDS\]/);
  if (!match) return [];

  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function removeAllMarkers(content: string): string {
  return content
    .replace(/\[CONTACT_FORM\]/g, '')
    .replace(/\[BOOKING\]/g, '')
    .replace(/\[NEWSLETTER\]/g, '')
    .replace(/\[PRODUCT_CARDS\][\s\S]*?\[\/PRODUCT_CARDS\]/g, '')
    .trim();
}

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

// Newsletter Form Component
const NewsletterForm: React.FC<{
  sessionId: string;
}> = ({ sessionId }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return;

    setIsSubmitting(true);
    try {
      await fetch(WIDGET_CONFIG.leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          sessionId,
          type: 'newsletter',
          tableName: WIDGET_CONFIG.tableName,
          timestamp: new Date().toISOString()
        })
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Newsletter submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed) return null;

  if (isSubmitted) {
    return (
      <div className="bm-newsletter bm-newsletter-success">
        ✅ Hvala! Naročeni ste na novice.
      </div>
    );
  }

  return (
    <div className="bm-newsletter">
      <form onSubmit={handleSubmit} className="bm-newsletter-inner">
        <input
          type="email"
          placeholder="📧 Vaš email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={!email.trim() || isSubmitting}>
          {isSubmitting ? '...' : 'Pošlji'}
        </button>
      </form>
      <button className="bm-newsletter-dismiss" onClick={() => setIsDismissed(true)}>
        Ne, hvala
      </button>
    </div>
  );
};

// Product Cards Carousel Component
const ProductCarousel: React.FC<{ products: ProductCard[] }> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!products || products.length === 0) return null;

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(products.length - 1, prev + 1));
  };

  return (
    <div className="bm-products">
      <div
        className="bm-products-carousel"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {products.map((product, idx) => (
          <div className="bm-product-card" key={idx}>
            <div className="bm-product-card-inner">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.ime_izdelka || 'Produkt'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="bm-product-card-body">
                <h5>{product.ime_izdelka || 'Brez imena'}</h5>
                {product.kratek_opis && <p>{product.kratek_opis}</p>}
                <a href={product.url || '#'} target="_blank" rel="noopener noreferrer">
                  Poglej več →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length > 1 && (
        <div className="bm-products-nav">
          <button
            className="bm-products-nav-btn"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Prejšnji"
          >
            <Icons.ChevronLeft />
          </button>
          <div className="bm-products-dots">
            {products.map((_, idx) => (
              <div
                key={idx}
                className={`bm-products-dot ${idx === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <button
            className="bm-products-nav-btn"
            onClick={goToNext}
            disabled={currentIndex === products.length - 1}
            aria-label="Naslednji"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

const ContactModal: React.FC<{
  onClose: () => void;
  chatHistory: Message[];
  sessionId: string;
}> = ({ onClose, chatHistory, sessionId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getFormattedChatHistory = () => {
    if (chatHistory.length === 0) return '[Ni zgodovine pogovora]';

    return chatHistory
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .map((m) => {
        const role = m.role === 'user' ? 'USER' : 'AI';
        return `${role}: ${m.content}`;
      })
      .join('\n\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(WIDGET_CONFIG.supportWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          sessionId,
          chatHistory: getFormattedChatHistory(),
          tableName: WIDGET_CONFIG.tableName,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Napaka pri pošiljanju (${response.status})`);
      }

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Pošiljanje ni uspelo. Prosimo, poskusite ponovno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal-header">
          <div className="bm-modal-header-content">
            <h3>Kontaktirajte nas</h3>
            <p>Izpolnite obrazec in odgovorili vam bomo</p>
          </div>
          <button className="bm-modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>
        <div className="bm-modal-content">
          {success ? (
            <div className="bm-success">
              <div className="bm-success-icon">
                <Icons.Check />
              </div>
              <h3>Sporočilo poslano!</h3>
              <p>Hvala za vaše sporočilo. Odgovorili vam bomo v najkrajšem možnem času.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="bm-form-error">{error}</div>}
              <div className="bm-form-group">
                <label>Ime</label>
                <input
                  type="text"
                  className="bm-input"
                  placeholder="Vaše ime"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="bm-form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="bm-input"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="bm-form-group">
                <label>Sporočilo</label>
                <textarea
                  className="bm-input bm-textarea"
                  placeholder="Vaše sporočilo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal booking" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal-header booking">
          <button className="bm-modal-close" onClick={onClose} style={{ marginRight: 12 }}>
            <Icons.Back />
          </button>
          <div className="bm-modal-header-content">
            <h3>Rezerviraj termin</h3>
            <p>Izberite prosti termin</p>
          </div>
          <button className="bm-modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>
        <div className="bm-modal-content">
          {isLoading && (
            <div className="bm-booking-loading">
              <div className="bm-booking-spinner" />
              <div className="bm-booking-loading-text">Nalagam koledar...</div>
            </div>
          )}
          <iframe
            src={WIDGET_CONFIG.bookingUrl}
            title="Booking"
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{
  content: string;
  isBot: boolean;
  sessionId: string;
  onContactClick: () => void;
  onBookingClick: () => void;
}> = ({ content, isBot, sessionId, onContactClick, onBookingClick }) => {
  if (!isBot) {
    return <>{content}</>;
  }

  // Check for markers
  const hasContact = hasContactFormMarker(content);
  const hasBooking = hasBookingMarker(content) && WIDGET_CONFIG.bookingEnabled;
  const hasNewsletter = hasNewsletterMarker(content);
  const hasProducts = hasProductCardsMarker(content);

  // Extract product cards data
  const products = hasProducts ? extractProductCards(content) : [];

  // Remove all markers from display
  const displayContent = removeAllMarkers(content);

  return (
    <>
      {displayContent && <div>{parseMarkdown(displayContent)}</div>}
      
      {hasProducts && products.length > 0 && <ProductCarousel products={products} />}
      
      {hasContact && (
        <button className="bm-action-btn" onClick={onContactClick}>
          <Icons.Mail />
          Odpri kontaktni obrazec
        </button>
      )}
      
      {hasBooking && (
        <button className="bm-action-btn booking" onClick={onBookingClick}>
          <Icons.Calendar />
          Rezerviraj termin
        </button>
      )}
      
      {hasNewsletter && <NewsletterForm sessionId={sessionId} />}
    </>
  );
};

// ============================================================================
// MAIN WIDGET
// ============================================================================

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [view, setView] = useState<View>('home');
  const [modal, setModal] = useState<ModalType>(null);

  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
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
        setSessions(
          parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: s.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          }))
        );
      } catch (e) {
        console.error('Failed to parse sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(`bm_sessions_${WIDGET_CONFIG.tableName}`, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Show welcome bubble after delay
  useEffect(() => {
    if (!isOpen && !welcomeDismissed && isHealthy) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        // Show suggestions after welcome bubble
        setTimeout(() => {
          if (WIDGET_CONFIG.suggestionButtons.length > 0) {
            setShowSuggestions(true);
          }
        }, 500);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
      setShowSuggestions(false);
    }
  }, [isOpen, welcomeDismissed, isHealthy]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Rotate typing messages when loading and not streaming
  useEffect(() => {
    if (isTyping && !isStreaming) {
      const interval = setInterval(() => {
        typingMessageIndex.current =
          (typingMessageIndex.current + 1) % WIDGET_CONFIG.typingMessages.length;
        setTypingMessage(WIDGET_CONFIG.typingMessages[typingMessageIndex.current]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isTyping, isStreaming]);

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

    const firstUserMessage = messages.find((m) => m.role === 'user');
    const preview = firstUserMessage?.content.slice(0, 50) || 'Nov pogovor';

    setSessions((prev) => {
      const existing = prev.findIndex((s) => s.id === currentSessionId);
      const session: Session = {
        id: currentSessionId,
        messages,
        createdAt: existing >= 0 ? prev[existing].createdAt : new Date(),
        preview
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = session;
        return updated;
      }
      return [session, ...prev];
    });
  }, [messages, currentSessionId]);

  // Save session when messages change
  useEffect(() => {
    saveCurrentSession();
  }, [messages, saveCurrentSession]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsStreaming(false);
    setTypingMessage(WIDGET_CONFIG.typingMessages[0]);

    const botMessageId = (Date.now() + 1).toString();

    try {
      await sendMessageToWebhook(currentSessionId, content, (streamedContent) => {
        setIsStreaming(true);
        setMessages((prev) => {
          const existing = prev.find((m) => m.id === botMessageId);
          if (existing) {
            return prev.map((m) =>
              m.id === botMessageId ? { ...m, content: streamedContent } : m
            );
          }
          return [
            ...prev,
            {
              id: botMessageId,
              role: 'bot',
              content: streamedContent,
              timestamp: new Date()
            }
          ];
        });
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: 'system',
          content: error.message || 'Oprostite, prišlo je do napake. Poskusite znova.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleStartConversation = async () => {
    if (!initialMessage.trim()) return;

    // Send lead data
    if (userName || userEmail) {
      try {
        await fetch(WIDGET_CONFIG.leadWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            sessionId: currentSessionId,
            tableName: WIDGET_CONFIG.tableName,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Lead webhook error:', error);
      }
    }

    if (!currentSessionId) {
      setCurrentSessionId(generateSessionId());
    }

    setView('chat');
    await sendMessage(initialMessage);
    setInitialMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    setShowWelcome(false);
    setWelcomeDismissed(true);
    setIsOpen(true);
    
    if (!currentSessionId) {
      const sessionId = generateSessionId();
      setCurrentSessionId(sessionId);
    }
    
    setView('chat');
    setTimeout(() => sendMessage(suggestion), 100);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowWelcome(false);
    setShowSuggestions(false);
    if (!currentSessionId) {
      startNewSession();
    }
  };

  if (!isHealthy) {
    return null;
  }

  return (
    <div className="bm-widget-container">
      {/* Suggestion Buttons */}
      {showSuggestions && !isOpen && WIDGET_CONFIG.suggestionButtons.length > 0 && (
        <div className="bm-suggestions">
          {WIDGET_CONFIG.suggestionButtons.map((suggestion, idx) => (
            <button
              key={idx}
              className="bm-suggestion-btn"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Welcome Bubble */}
      {showWelcome && !isOpen && !showSuggestions && (
        <div className="bm-welcome-bubble" onClick={handleOpen}>
          <p>{WIDGET_CONFIG.welcomeMessage}</p>
          <button
            className="bm-welcome-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowWelcome(false);
              setWelcomeDismissed(true);
            }}
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Trigger Button */}
      <button
        className={`bm-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
      >
        {isOpen ? <Icons.Close /> : <Icons.Chat />}
      </button>

      {/* Widget */}
      {isOpen && (
        <div className="bm-widget">
          {view === 'home' && (
            <>
              <div className="bm-header">
                <Avatar />
                <h2>{WIDGET_CONFIG.homeTitle}</h2>
                <p>{WIDGET_CONFIG.homeSubtitle}</p>
              </div>
              <div className="bm-content">
                {WIDGET_CONFIG.showNameField && (
                  <div className="bm-form-group">
                    <label>
                      Ime <span>(opcijsko)</span>
                    </label>
                    <input
                      type="text"
                      className="bm-input"
                      placeholder="Vaše ime"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                )}
                {WIDGET_CONFIG.showEmailField && (
                  <div className="bm-form-group">
                    <label>
                      Email <span>(opcijsko)</span>
                    </label>
                    <input
                      type="email"
                      className="bm-input"
                      placeholder="vas@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                )}
                <div className="bm-form-group">
                  <label>Sporočilo</label>
                  <textarea
                    className="bm-input bm-textarea"
                    placeholder={WIDGET_CONFIG.messagePlaceholder}
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleStartConversation();
                      }
                    }}
                  />
                </div>
                <button
                  className="bm-submit-btn"
                  onClick={handleStartConversation}
                  disabled={!initialMessage.trim()}
                >
                  Začni pogovor
                </button>
              </div>
              <div className="bm-nav">
                <button className="bm-nav-item active">
                  <Icons.Home />
                  <span>Domov</span>
                </button>
                <button className="bm-nav-item" onClick={() => setView('history')}>
                  <Icons.History />
                  <span>Zgodovina</span>
                </button>
              </div>
              {WIDGET_CONFIG.showFooter && (
                <div className="bm-footer">
                  <a href={WIDGET_CONFIG.poweredByUrl} target="_blank" rel="noopener noreferrer">
                    Powered by {WIDGET_CONFIG.poweredByName}
                  </a>
                </div>
              )}
            </>
          )}

          {view === 'chat' && (
            <>
              <div className="bm-header-chat">
                <button className="bm-back-btn" onClick={() => setView('home')}>
                  <Icons.Back />
                </button>
                <Avatar small />
                <div className="bm-header-info">
                  <h3>{WIDGET_CONFIG.botName}</h3>
                  <span>Običajno odgovorimo v nekaj minutah</span>
                </div>
                <button className="bm-close-btn" onClick={() => setIsOpen(false)}>
                  <Icons.Close />
                </button>
              </div>
              <div className="bm-content">
                <div className="bm-messages">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`bm-message ${msg.role}`}>
                      {msg.role === 'bot' && <Avatar small />}
                      {msg.role === 'system' ? (
                        <div className="bm-message-system">
                          <div className="bm-message-system-bubble">{msg.content}</div>
                        </div>
                      ) : (
                        <div className="bm-message-content">
                          <div className="bm-bubble">
                            <MessageContent
                              content={msg.content}
                              isBot={msg.role === 'bot'}
                              sessionId={currentSessionId}
                              onContactClick={() => setModal('contact')}
                              onBookingClick={() => setModal('booking')}
                            />
                          </div>
                          <div className="bm-timestamp">{formatTime(msg.timestamp)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && !isStreaming && (
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
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
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
                  <a href={WIDGET_CONFIG.poweredByUrl} target="_blank" rel="noopener noreferrer">
                    Powered by {WIDGET_CONFIG.poweredByName}
                  </a>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <>
              <div className="bm-header-chat">
                <button className="bm-back-btn" onClick={() => setView('home')}>
                  <Icons.Back />
                </button>
                <div className="bm-header-info">
                  <h3>Zgodovina pogovorov</h3>
                  <span>{sessions.length} pogovor(ov)</span>
                </div>
                <button className="bm-close-btn" onClick={() => setIsOpen(false)}>
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
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="bm-history-item"
                        onClick={() => loadSession(session)}
                      >
                        <div className="bm-history-icon">
                          <Icons.MessageSquare />
                        </div>
                        <div className="bm-history-content">
                          <h4>{session.preview}...</h4>
                          <p>
                            {session.messages.length} sporočil(a) ·{' '}
                            {formatTimestamp(session.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="bm-submit-btn bm-new-chat-btn" onClick={startNewSession}>
                  <Icons.Plus /> Nov pogovor
                </button>
              </div>
              <div className="bm-nav">
                <button className="bm-nav-item" onClick={() => setView('home')}>
                  <Icons.Home />
                  <span>Domov</span>
                </button>
                <button className="bm-nav-item active">
                  <Icons.History />
                  <span>Zgodovina</span>
                </button>
              </div>
              {WIDGET_CONFIG.showFooter && (
                <div className="bm-footer">
                  <a href={WIDGET_CONFIG.poweredByUrl} target="_blank" rel="noopener noreferrer">
                    Powered by {WIDGET_CONFIG.poweredByName}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'contact' && (
        <ContactModal
          onClose={() => setModal(null)}
          chatHistory={messages}
          sessionId={currentSessionId}
        />
      )}
      {modal === 'booking' && <BookingModal onClose={() => setModal(null)} />}
    </div>
  );
};

// ============================================================================
// AUTO-INIT
// ============================================================================

function injectStyles() {
  if (document.getElementById('bm-widget-styles')) return;
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
