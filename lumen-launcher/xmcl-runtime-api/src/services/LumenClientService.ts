import { GenericEventEmitter } from '../events'
import { ServiceKey } from './Service'

export interface LumenClientModFile {
  /**
   * The file name to place under the instance `mods` folder
   */
  fileName: string
  /**
   * The download url of the file
   */
  url: string
}

export interface EnsureLumenModsOptions {
  /**
   * The instance path
   */
  instancePath: string
  /**
   * The mod files to ensure
   */
  files: LumenClientModFile[]
}

interface LumenClientServiceEventMap {
  /**
   * Emitted when a file downloaded from the embedded web browser finishes.
   */
  'browser-download-done': {
    fileName: string
    path: string
    state: 'completed' | 'cancelled' | 'interrupted'
  }
}

/**
 * Provide the ability to install the Lumen Client mod (and its dependencies)
 * into an instance `mods` folder, downloading only the missing files.
 */
export interface LumenClientService extends GenericEventEmitter<LumenClientServiceEventMap> {
  /**
   * Ensure the given mod files exist under the instance `mods` folder.
   * Missing files are downloaded from their url.
   * @returns the file names that were actually downloaded
   */
  ensureMods(options: EnsureLumenModsOptions): Promise<string[]>
  /**
   * Check which of the given file names already exist in the instance `mods` folder.
   */
  getInstalledMods(instancePath: string, fileNames: string[]): Promise<string[]>
}

export const LumenClientServiceKey: ServiceKey<LumenClientService> = 'LumenClientService'
