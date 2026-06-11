import { injection } from '@/util/inject'
import { InstanceModsServiceKey, LumenClientServiceKey } from '@xmcl/runtime-api'
import { kInstance } from './instance'
import { useNotifier } from './notifier'
import { useService } from './service'

/**
 * Import files downloaded from the embedded mod-site browser into the
 * currently selected instance. Mount once at app level.
 */
export function useLumenBrowserDownloadImport() {
  const { on, removeListener } = useService(LumenClientServiceKey)
  const { install } = useService(InstanceModsServiceKey)
  const { path } = injection(kInstance)
  const { notify } = useNotifier()

  const onDone = async ({
    fileName,
    path: filePath,
    state,
  }: {
    fileName: string
    path: string
    state: 'completed' | 'cancelled' | 'interrupted'
  }) => {
    if (state !== 'completed') {
      if (state === 'interrupted') {
        notify({ level: 'error', title: `Descarga fallida: ${fileName}` })
      }
      return
    }
    if (fileName.toLowerCase().endsWith('.jar')) {
      try {
        await install({ files: [filePath], path: path.value })
        notify({ level: 'success', title: `${fileName} instalado en la instancia` })
      } catch (e) {
        console.error(e)
        notify({ level: 'error', title: `No se pudo instalar ${fileName}` })
      }
    } else {
      notify({
        level: 'info',
        title: `${fileName} guardado en la carpeta browser-downloads del launcher`,
      })
    }
  }

  on('browser-download-done', onDone)
  onUnmounted(() => {
    removeListener('browser-download-done', onDone)
  })
}
