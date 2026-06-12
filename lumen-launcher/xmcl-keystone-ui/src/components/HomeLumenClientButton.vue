<template>
  <div class="lumen-play-group inline-flex items-stretch">
    <button
      class="lumen-play-btn"
      :disabled="isValidating || (loading && !installing)"
      :aria-label="`Play with Lumen Client`"
      :title="supported ? undefined : `Minecraft ${minecraft} no tiene build de Lumen: se usará una instancia Lumen Client dedicada`"
      @click="onLumenClick()"
    >
      <span class="lumen-play-btn__glow" aria-hidden="true" />

      <!-- Lumen icon -->
      <LumenIcon class="lumen-play-btn__icon" :size="20" />

      <span class="lumen-play-btn__labels">
        <span class="lumen-play-btn__play">
          <span v-if="loading || installing">
            <v-progress-circular indeterminate :size="12" :width="2" class="mr-1" />
          </span>
          {{ installing ? 'Instalando…' : loading ? t('launch.cancel') : t('launch.launch') }}
        </span>
        <span class="lumen-play-btn__sub">{{ !supported ? 'Lumen Client · instancia dedicada' : installed ? 'Lumen Client · Meteor' : 'Lumen Client · se descargará' }}</span>
      </span>
    </button>

    <!-- Optional mods menu -->
    <v-menu :close-on-content-click="false" location="top">
      <template #activator="{ props: menuProps }">
        <button
          class="lumen-play-options"
          v-bind="menuProps"
          aria-label="Opciones de Lumen Client"
          title="Opciones de Lumen Client"
        >
          <v-icon size="16">tune</v-icon>
        </button>
      </template>
      <v-card class="pa-2" min-width="320">
        <div class="text-xs font-bold opacity-60 px-2 pt-1">Mods opcionales (se aplican al lanzar)</div>
        <v-list density="compact">
          <v-list-item v-for="mod in lumenClientConfig.optionalMods" :key="mod.id">
            <template #prepend>
              <v-switch
                :model-value="enabledOptionalMods.includes(mod.id)"
                density="compact"
                hide-details
                color="primary"
                class="mr-3"
                @update:model-value="toggleOptionalMod(mod.id)"
              />
            </template>
            <v-list-item-title>{{ mod.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ mod.description }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import LumenIcon from '@/components/LumenIcon.vue'
import { kInstance } from '@/composables/instance'
import { kInstanceVersionInstall } from '@/composables/instanceVersionInstall'
import { kInstances } from '@/composables/instances'
import { kLaunchButton } from '@/composables/launchButton'
import { useLumenClientInstall } from '@/composables/lumenClient'
import { useNotifier } from '@/composables/notifier'
import { useService } from '@/composables/service'
import { lumenClientConfig } from '@/lumen.config'
import { injection } from '@/util/inject'
import { PresenceServiceKey } from '@xmcl/runtime-api'

const { onClick, loading } = injection(kLaunchButton)
const { isValidating } = injection(kInstances)
const { fix: fixVersionIssues } = injection(kInstanceVersionInstall)
const { runtime, path } = injection(kInstance)
const { ensureLumenClient, ensureLumenInstance, installing, installed, supported, enabledOptionalMods } = useLumenClientInstall()
const { setPlaying } = useService(PresenceServiceKey)
const { notify } = useNotifier()

function toggleOptionalMod(id: string) {
  const list = enabledOptionalMods.value
  enabledOptionalMods.value = list.includes(id)
    ? list.filter((m) => m !== id)
    : [...list, id]
}
const { t } = useI18n()

const minecraft = computed(() => runtime.value.minecraft)

function waitForInstance(targetPath: string, timeout = 8000) {
  if (path.value === targetPath) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      unwatch()
      resolve()
    }, timeout)
    const unwatch = watch(path, (p) => {
      if (p === targetPath) {
        clearTimeout(timer)
        unwatch()
        resolve()
      }
    })
  })
}

async function onLumenClick() {
  // While launching/cancelling, behave exactly like the normal launch button
  if (loading.value || installing.value) {
    return onClick()
  }
  try {
    // Switch to (or create) a compatible instance when this Minecraft
    // version has no Lumen Client build.
    const target = await ensureLumenInstance()
    if (target.path !== path.value) {
      notify({ level: 'info', title: `Cambiando a la instancia ${target.minecraft} de Lumen Client` })
      await waitForInstance(target.path)
    }
    const { fabricOk } = await ensureLumenClient(target)
    if (!fabricOk) {
      // The jar is in mods/, but without Fabric it won't load. Tell the user
      // instead of silently launching vanilla.
      notify({
        level: 'error',
        title: `Fabric no está disponible para Minecraft ${target.minecraft}. El cliente no se cargará hasta que exista soporte de Fabric para esa versión.`,
      })
      return
    }
    // Resolve any remaining version issues (libraries, assets…) before launch.
    await fixVersionIssues()
    // Set before launching so the presence survives the game-start event
    setPlaying('Jugando "Lumen Client"').catch(() => {})
    await onClick()
  } catch (e) {
    notify({
      level: 'error',
      title: `No se pudo instalar Lumen Client: ${e instanceof Error ? e.message : e}`,
    })
  }
}
</script>

<style scoped>
.lumen-play-group {
  gap: 4px;
}

.lumen-play-options {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(20, 20, 38, 0.82);
  backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: border-color 0.22s ease, color 0.22s ease;
}

.lumen-play-options:hover {
  border-color: rgba(255, 255, 255, 0.32);
  color: rgba(255, 255, 255, 0.95);
}

.lumen-play-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(135deg,
      rgba(30, 30, 50, 0.82) 0%,
      rgba(15, 15, 30, 0.90) 100%
    );
  backdrop-filter: blur(20px);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.22s ease, transform 0.15s ease, box-shadow 0.22s ease;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}

.lumen-play-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.32);
  transform: translateY(-1px);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.lumen-play-btn:active:not(:disabled) {
  transform: translateY(0);
}

.lumen-play-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Shimmer glow overlay */
.lumen-play-btn__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 70%
  );
  pointer-events: none;
}

.lumen-play-btn__icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.82);
  position: relative;
  z-index: 1;
}

.lumen-play-btn__labels {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.lumen-play-btn__play {
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.01em;
  line-height: 1;
  display: flex;
  align-items: center;
}

.lumen-play-btn__sub {
  font-size: 0.62rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.38);
  letter-spacing: 0.04em;
  line-height: 1;
}
</style>
