/**
 * Lumen Launcher — brand configuration.
 * Edit `bannerUrl` to point at your ad image or iframe source.
 * Set `bannerEnabled` to false to hide the banner globally.
 */
export const lumenConfig = {
  bannerEnabled: true,
  bannerUrl: 'https://placehold.co/300x90/111111/ffffff?text=Lumen+Banner',
  bannerLinkUrl: 'https://github.com/MinirickDev/Lumen-Launcher',
}

/**
 * Lumen Client (Meteor Client fork) auto-install configuration.
 *
 * The launch button downloads the client jar (and the dependencies listed
 * below) into the instance `mods` folder — only the missing files are
 * downloaded. Publish the jar of each supported Minecraft version as a
 * GitHub release asset following the url pattern of `downloadUrl`.
 */
/** Lumen cube icon as an inline SVG data URI, used for the Lumen instance. */
export const lumenClientIcon =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">' +
      '<rect x="0" y="2.5" width="6" height="2.2" rx="1.1" fill="#7c3aed"/>' +
      '<rect x="0" y="7" width="4.8" height="2.2" rx="1.1" fill="#7c3aed" opacity="0.72"/>' +
      '<rect x="0" y="11.5" width="3.6" height="2.2" rx="1.1" fill="#7c3aed" opacity="0.48"/>' +
      '<path d="M13 4.5L18.5 7.5L13 10.5L7.5 7.5Z" fill="#a855f7"/>' +
      '<path d="M18.5 7.5V13.5L13 16.5V10.5Z" fill="#7c3aed" opacity="0.62"/>' +
      '<path d="M7.5 7.5V13.5L13 16.5V10.5Z" fill="#7c3aed" opacity="0.8"/>' +
      '</svg>',
  )

export const lumenClientConfig = {
  name: 'Lumen Client',
  /** Minecraft versions with a published Lumen Client jar */
  supportedVersions: ['26.1.2'],
  /** File name of the client jar inside the instance mods folder */
  modFileName: (minecraft: string) => `lumen-client-${minecraft}.jar`,
  /** Download url of the client jar for a Minecraft version */
  downloadUrl: (minecraft: string) =>
    `https://github.com/MinirickDev/Lumen-Launcher/releases/download/lumen-client-${minecraft}/lumen-client-${minecraft}.jar`,
  /**
   * Modrinth project ids installed alongside the client, resolved to the
   * right version for the instance's Minecraft version. Fabric API keeps
   * Lumen addons and most companion mods working out of the box.
   * `replaces` removes outdated copies so the mod stays up to date.
   */
  modrinthDependencies: [
    { id: 'fabric-api', replaces: '^fabric-api-.*\\.jar$' },
  ],
  /**
   * Optional mods the user can toggle from the Lumen launch button. Always
   * resolved to the newest Modrinth version compatible with the instance's
   * Minecraft version (the same one Meteor/Lumen targets).
   */
  optionalMods: [
    {
      id: 'viafabricplus',
      name: 'ViaFabricPlus',
      description: 'Conéctate a servidores de versiones anteriores de Minecraft',
      replaces: '^viafabricplus.*\\.jar$',
    },
  ],
}

/**
 * Quick-access mod sites embedded in the in-app browser (Store → Explorar la web).
 */
export const lumenModSites = [
  {
    id: 'modrinth',
    name: 'Modrinth',
    home: 'https://modrinth.com/mods',
  },
  {
    id: 'curseforge',
    name: 'CurseForge',
    home: 'https://www.curseforge.com/minecraft/search?class=mc-mods',
  },
  {
    id: 'ftb',
    name: 'FTB',
    home: 'https://www.feed-the-beast.com/modpacks',
  },
] as const

/**
 * Background videos per Minecraft version (Launch screen background).
 *
 * Key: major version prefix (e.g. '26.1'). Value: a YouTube video id/url or
 * a direct mp4/webm url. When a version has no entry, the launcher falls
 * back to the official Mojang artwork of that exact version (from
 * launchercontent.mojang.com) with a slow pan animation.
 *
 * Users can override these per-version from Settings → Appearance.
 */
export const lumenVersionVideos: Record<string, string> = {
  // '26.1': 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
  // '26.2': 'https://example.com/trailer.mp4',
}
