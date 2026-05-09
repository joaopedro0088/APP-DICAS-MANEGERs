/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from '../store';

const playSound = async (type: 'click' | 'success' | 'error' | 'transition') => {
  const settings = await storage.getAppSettings();
  if (!settings.sounds) return;

  const sounds = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    transition: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
  };

  const audio = new Audio(sounds[type]);
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Browser might block auto-play
};

export const sounds = {
  click: () => playSound('click'),
  success: () => playSound('success'),
  error: () => playSound('error'),
  transition: () => playSound('transition'),
};
