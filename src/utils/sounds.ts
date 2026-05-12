/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from '../store';

const playSound = async (type: 'click' | 'success' | 'error' | 'transition' | 'generate' | 'save' | 'goal') => {
  const settings = await storage.getAppSettings();
  if (!settings.sounds) return;

  const sounds = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    transition: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    generate: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
    save: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
    goal: 'https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3'
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
  generate: () => playSound('generate'),
  save: () => playSound('save'),
  goal: () => playSound('goal'),
};
