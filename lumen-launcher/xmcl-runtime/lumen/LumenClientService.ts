import { download } from '@xmcl/file-transfer'
import {
  EnsureLumenModsOptions,
  LumenClientServiceKey,
  type LumenClientService as ILumenClientService,
} from '@xmcl/runtime-api'
import { ensureDir, pathExists } from 'fs-extra'
import { join } from 'path'
import { Inject, LauncherAppKey } from '~/app'
import { kDownloadOptions } from '~/network'
import { AbstractService, ExposeServiceKey, Lock } from '~/service'
import { LauncherApp } from '../app/LauncherApp'

@ExposeServiceKey(LumenClientServiceKey)
export class LumenClientService extends AbstractService implements ILumenClientService {
  constructor(@Inject(LauncherAppKey) app: LauncherApp) {
    super(app)
  }

  async getInstalledMods(instancePath: string, fileNames: string[]): Promise<string[]> {
    const modsDir = join(instancePath, 'mods')
    const installed: string[] = []
    for (const name of fileNames) {
      if (await pathExists(join(modsDir, name))) {
        installed.push(name)
      }
    }
    return installed
  }

  @Lock('lumen-client-install')
  async ensureMods({ instancePath, files }: EnsureLumenModsOptions): Promise<string[]> {
    const modsDir = join(instancePath, 'mods')
    await ensureDir(modsDir)
    const downloadOptions = await this.app.registry.get(kDownloadOptions)
    const downloaded: string[] = []
    for (const file of files) {
      const destination = join(modsDir, file.fileName)
      if (await pathExists(destination)) {
        continue
      }
      this.log(`Downloading ${file.fileName} from ${file.url}`)
      await download({
        url: file.url,
        destination,
        ...downloadOptions,
      })
      downloaded.push(file.fileName)
    }
    return downloaded
  }
}
