import { ElectronController } from '@/ElectronController'
import { LumenClientService } from '@xmcl/runtime/lumen'
import { app } from 'electron'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { ControllerPlugin } from './plugin'

/**
 * Capture downloads started from the embedded mod-site browser (Modrinth /
 * CurseForge / FTB webviews). Mod files are saved into a managed
 * `browser-downloads` folder without prompting, then the renderer is notified
 * through the LumenClientService event channel so it can import the file into
 * the current instance.
 */
export const browserDownload: ControllerPlugin = function (this: ElectronController) {
  const handled = /\.(jar|mrpack|zip)$/i

  app.on('session-created', (session) => {
    session.on('will-download', (_event, item) => {
      const fileName = item.getFilename()
      if (!handled.test(fileName)) {
        // Let Electron show the regular save dialog for anything else
        return
      }
      const folder = join(this.app.appDataPath, 'browser-downloads')
      mkdirSync(folder, { recursive: true })
      const savePath = join(folder, fileName)
      item.setSavePath(savePath)
      item.once('done', (_e, state) => {
        this.app.registry.get(LumenClientService).then((service) => {
          service.emit('browser-download-done', { fileName, path: savePath, state })
        })
      })
    })
  })
}
