/* eslint-disable no-template-curly-in-string */
import { config as dotenv } from 'dotenv'
import type { Configuration } from 'electron-builder'

dotenv()

export const config = {
  productName: 'Lumen Launcher',
  appId: 'lumen-launcher',
  directories: {
    output: 'build/output',
    buildResources: 'build',
    app: '.',
  },
  protocols: {
    name: 'Lumen Launcher',
    schemes: ['lumen'],
  },
  // assign publish for auto-updater
  // set this to your own repo!
  publish: [{
    provider: 'github',
    owner: 'Minirick0-0',
    repo: 'Lumen-Launcher',
  }],
  files: [{
    from: 'dist',
    to: '.',
    filter: ['**/*.js', '**/*.ico', '**/*.png', '**/*.webp', '**/*.svg', '*.node', '**/*.html', '**/*.css', '**/*.woff2'],
  }, {
    from: '.',
    to: '.',
    filter: 'package.json',
  }],
  artifactName: 'lumen-launcher-${version}-${platform}-${arch}.${ext}',
  appx: {
    displayName: 'Lumen Launcher',
    applicationId: 'lumen-launcher',
    identityName: 'lumen-launcher',
    backgroundColor: 'transparent',
    publisher: process.env.PUBLISHER,
    publisherDisplayName: 'CI010',
    setBuildNumber: true,
  },
  dmg: {
    artifactName: 'lumen-launcher-${version}-${arch}.${ext}',
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  mac: {
    icon: 'icons/dark.icns',
    darkModeSupport: true,
    target: [
      {
        target: 'dmg',
        arch: ['arm64', 'x64'],
      },
    ],
    extendInfo: {
      NSMicrophoneUsageDescription: 'A Minecraft mod wants to access your microphone.',
      NSCameraUsageDescription: 'Please give us access to your camera',
      'com.apple.security.device.audio-input': true,
      'com.apple.security.device.camera': true,
    },
  },
  win: {
    executableName: 'lumen-launcher',
    certificateFile: undefined as string | undefined,
    publisherName: 'Lumen Launcher',
    icon: 'icons/dark.ico',
    target: [
      {
        target: 'zip',
        arch: ['x64'],
      },
    ],
  },
  linux: {
    executableName: 'lumen-launcher',
    desktop: {
      MimeType: 'x-scheme-handler/lumen',
      StartupWMClass: 'lumen-launcher',
    },
    category: 'Game',
    icon: 'icons/dark.icns',
    artifactName: 'lumen-launcher-${version}-${arch}.${ext}',
    target: [
      { target: 'AppImage', arch: ['x64'] },
    ],
  },
  snap: {
    publish: [
      'github',
    ],
  },
} satisfies Configuration
