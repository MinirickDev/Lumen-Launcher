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
   */
  modrinthDependencies: ['fabric-api'],
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
