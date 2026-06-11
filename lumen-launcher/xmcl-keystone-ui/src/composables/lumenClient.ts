import { lumenClientConfig } from '@/lumen.config'
import { clientModrinthV2 } from '@/util/clients'
import { injection } from '@/util/inject'
import { LumenClientModFile, LumenClientServiceKey } from '@xmcl/runtime-api'
import { Ref } from 'vue'
import { kInstance } from './instance'
import { useInstanceModLoaderDefault } from './instanceModLoaderDefault'
import { useService } from './service'

export interface LumenClientInstall {
  /** Whether the install/check is currently running */
  installing: Ref<boolean>
  /** Whether the Lumen Client jar is already in the instance mods folder */
  installed: Ref<boolean>
  /** Whether there is a published Lumen Client jar for the instance Minecraft version */
  supported: Ref<boolean>
  ensureLumenClient(): Promise<void>
}

/**
 * Install Lumen Client into the current instance: ensure the Fabric loader is
 * configured, then download the client jar and its Modrinth dependencies into
 * the instance `mods` folder. Files already present are never re-downloaded.
 */
export function useLumenClientInstall(): LumenClientInstall {
  const { path, runtime } = injection(kInstance)
  const { ensureMods, getInstalledMods } = useService(LumenClientServiceKey)
  const installModLoader = useInstanceModLoaderDefault()

  const installing = ref(false)
  const installed = ref(false)

  const minecraft = computed(() => runtime.value.minecraft)
  const supported = computed(() =>
    lumenClientConfig.supportedVersions.includes(minecraft.value),
  )

  async function refresh() {
    if (!path.value || !minecraft.value) return
    const fileName = lumenClientConfig.modFileName(minecraft.value)
    const result = await getInstalledMods(path.value, [fileName]).catch(() => [])
    installed.value = result.length > 0
  }

  watch([path, minecraft], refresh, { immediate: true })

  async function ensureLumenClient() {
    const mc = minecraft.value
    const instancePath = path.value
    installing.value = true
    try {
      if (!runtime.value.fabricLoader) {
        const ok = await installModLoader(instancePath, runtime.value, ['fabric'])
        if (!ok) {
          throw new Error(`Fabric Loader is not available for Minecraft ${mc}`)
        }
      }

      const files: LumenClientModFile[] = [
        {
          fileName: lumenClientConfig.modFileName(mc),
          url: lumenClientConfig.downloadUrl(mc),
        },
      ]
      for (const projectId of lumenClientConfig.modrinthDependencies) {
        try {
          const versions = await clientModrinthV2.getProjectVersions(projectId, {
            loaders: ['fabric'],
            gameVersions: [mc],
          })
          const version = versions[0]
          const file = version?.files.find((f) => f.primary) ?? version?.files[0]
          if (file) {
            files.push({ fileName: file.filename, url: file.url })
          }
        } catch (e) {
          // A missing optional dependency should not block the client install
          console.warn(`Failed to resolve Lumen dependency ${projectId}`, e)
        }
      }

      await ensureMods({ instancePath, files })
      installed.value = true
    } finally {
      installing.value = false
    }
  }

  return { ensureLumenClient, installing, installed, supported }
}
