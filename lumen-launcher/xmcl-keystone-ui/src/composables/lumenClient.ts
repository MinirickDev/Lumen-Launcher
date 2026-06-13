import { lumenClientConfig, lumenClientIcon } from '@/lumen.config'
import { clientModrinthV2 } from '@/util/clients'
import { injection } from '@/util/inject'
import { useLocalStorage } from '@vueuse/core'
import { InstallServiceKey, InstanceServiceKey, LumenClientModFile, LumenClientServiceKey } from '@xmcl/runtime-api'
import { Ref } from 'vue'
import { kInstance } from './instance'
import { kInstances } from './instances'
import { useService } from './service'

export interface LumenClientInstall {
  /** Whether the install/check is currently running */
  installing: Ref<boolean>
  /** Whether the Lumen Client jar is already in the instance mods folder */
  installed: Ref<boolean>
  /** Whether there is a published Lumen Client jar for the instance Minecraft version */
  supported: Ref<boolean>
  ensureLumenInstance(): Promise<{ path: string; minecraft: string }>
  ensureLumenClient(target?: { path: string; minecraft: string }): Promise<{ fabricOk: boolean }>
  openLumenInstance(): Promise<string>
  /** Modrinth project ids of the optional mods the user enabled */
  enabledOptionalMods: Ref<string[]>
}

export function useLumenClientInstall(): LumenClientInstall {
  const { path, runtime } = injection(kInstance)
  const { instances, selectedInstance } = injection(kInstances)
  const { ensureMods, getInstalledMods } = useService(LumenClientServiceKey)
  const { createInstance, editInstance } = useService(InstanceServiceKey)
  const { installFabric } = useService(InstallServiceKey)

  const installing = ref(false)
  const installed = ref(false)
  const enabledOptionalMods = useLocalStorage<string[]>('lumen.optionalMods', [])

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

  async function findOrCreateLumenInstance(): Promise<{ path: string; minecraft: string }> {
    const byName = instances.value.find(
      (i) =>
        i.name === lumenClientConfig.name &&
        lumenClientConfig.supportedVersions.includes(i.runtime.minecraft),
    )
    const bySupportedVersion = instances.value.find((i) =>
      lumenClientConfig.supportedVersions.includes(i.runtime.minecraft),
    )
    const existing = byName ?? bySupportedVersion
    if (existing) {
      selectedInstance.value = existing.path
      return { path: existing.path, minecraft: existing.runtime.minecraft }
    }
    const target =
      lumenClientConfig.supportedVersions[lumenClientConfig.supportedVersions.length - 1]
    const created = await createInstance({
      name: lumenClientConfig.name,
      icon: lumenClientIcon,
      runtime: { minecraft: target },
    })
    selectedInstance.value = created
    return { path: created, minecraft: target }
  }

  async function ensureLumenInstance(): Promise<{ path: string; minecraft: string }> {
    if (supported.value) {
      return { path: path.value, minecraft: minecraft.value }
    }
    return findOrCreateLumenInstance()
  }

  async function openLumenInstance(): Promise<string> {
    const result = await findOrCreateLumenInstance()
    return result.path
  }

  /**
   * Configure AND install the Fabric environment using direct API calls
   * (avoids SWRV context issues in async callbacks). Returns false if Fabric
   * is not available for the given Minecraft version.
   */
  async function setupFabricEnvironment(
    instancePath: string,
    mc: string,
    instanceRuntime: { fabricLoader?: string; minecraft: string },
  ): Promise<boolean> {
    try {
      const [gameVersions, loaderVersions] = await Promise.all([
        fetch('https://meta.fabricmc.net/v2/versions/game')
          .then((r) => r.json() as Promise<Array<{ version: string }>>),
        fetch('https://meta.fabricmc.net/v2/versions/loader')
          .then((r) => r.json() as Promise<Array<{ version: string; stable: boolean }>>),
      ])

      if (!gameVersions.some((v) => v.version === mc)) return false

      const loader = loaderVersions.find((l) => l.stable) ?? loaderVersions[0]
      if (!loader) return false

      if (instanceRuntime.fabricLoader !== loader.version) {
        await editInstance({
          instancePath,
          runtime: { ...instanceRuntime, fabricLoader: loader.version },
          version: '',
        })
      }
      await installFabric({ loader: loader.version, minecraft: mc })
      return true
    } catch (e) {
      console.warn('Failed to set up Fabric environment for Lumen Client', e)
      return false
    }
  }

  async function ensureLumenClient(target?: { path: string; minecraft: string }) {
    const mc = target?.minecraft ?? minecraft.value
    const instancePath = target?.path ?? path.value
    installing.value = true
    try {
      const instance = instances.value.find((i) => i.path === instancePath)
      // If instance not yet in list (just created), use target MC version for runtime
      const instanceRuntime = instance?.runtime ?? { minecraft: mc }

      const fabricOk = await setupFabricEnvironment(instancePath, mc, instanceRuntime)

      const files: LumenClientModFile[] = [
        {
          fileName: lumenClientConfig.modFileName(mc),
          url: lumenClientConfig.downloadUrl(mc),
          checkUpdate: true,
        },
      ]
      const resolve = async (projectId: string, replaces?: string) => {
        try {
          const versions = await clientModrinthV2.getProjectVersions(projectId, {
            loaders: ['fabric'],
            gameVersions: [mc],
          })
          const version = versions[0]
          const file = version?.files.find((f) => f.primary) ?? version?.files[0]
          if (file) {
            files.push({ fileName: file.filename, url: file.url, replaces })
          }
        } catch (e) {
          console.warn(`Failed to resolve Lumen dependency ${projectId}`, e)
        }
      }
      for (const dep of lumenClientConfig.modrinthDependencies) {
        await resolve(dep.id, dep.replaces)
      }
      const remove: string[] = []
      for (const mod of lumenClientConfig.optionalMods) {
        if (enabledOptionalMods.value.includes(mod.id)) {
          await resolve(mod.id, mod.replaces)
        } else {
          remove.push(mod.replaces)
        }
      }

      await ensureMods({ instancePath, files, remove })
      installed.value = true
      return { fabricOk }
    } finally {
      installing.value = false
    }
  }

  return { ensureLumenClient, ensureLumenInstance, openLumenInstance, installing, installed, supported, enabledOptionalMods }
}