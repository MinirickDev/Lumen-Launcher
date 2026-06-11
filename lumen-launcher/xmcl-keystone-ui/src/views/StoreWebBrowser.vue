<template>
  <div class="store-web-browser w-full flex flex-col">
    <div class="browser-toolbar flex items-center gap-1 px-3 py-2 flex-none">
      <v-btn icon variant="text" size="small" :disabled="!canGoBack" @click="goBack">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-btn icon variant="text" size="small" :disabled="!canGoForward" @click="goForward">
        <v-icon>arrow_forward</v-icon>
      </v-btn>
      <v-btn icon variant="text" size="small" @click="reload">
        <v-icon>refresh</v-icon>
      </v-btn>

      <div class="site-tabs flex items-center gap-1 mx-2">
        <button
          v-for="s in lumenModSites"
          :key="s.id"
          class="site-tab"
          :class="{ active: s.id === currentSite }"
          @click="openSite(s.id)"
        >
          {{ s.name }}
        </button>
      </div>

      <div class="current-url flex-grow truncate text-xs opacity-50 select-text">
        {{ currentUrl }}
      </div>

      <v-btn
        icon
        variant="text"
        size="small"
        title="Abrir en el navegador externo"
        @click="openExternal"
      >
        <v-icon>open_in_new</v-icon>
      </v-btn>
    </div>

    <v-progress-linear :active="loading" indeterminate height="2" class="flex-none" />

    <div class="browser-hint flex-none px-4 py-1 text-xs opacity-40">
      Los .jar que descargues aquí se instalan automáticamente en la instancia actual.
    </div>

    <webview ref="view" class="browser-view flex-grow w-full" :src="initialUrl" />
  </div>
</template>

<script lang="ts" setup>
import { lumenModSites } from '@/lumen.config'

const route = useRoute()
const router = useRouter()

type SiteId = (typeof lumenModSites)[number]['id']

const currentSite = ref<SiteId>(
  (lumenModSites.find((s) => s.id === route.params.site)?.id ?? 'modrinth') as SiteId,
)
const initialUrl = ref(
  lumenModSites.find((s) => s.id === currentSite.value)?.home ?? lumenModSites[0].home,
)

const view = ref<any>(null)
const loading = ref(false)
const canGoBack = ref(false)
const canGoForward = ref(false)
const currentUrl = ref(initialUrl.value)

function syncState() {
  const v = view.value
  if (!v) return
  try {
    canGoBack.value = v.canGoBack()
    canGoForward.value = v.canGoForward()
    currentUrl.value = v.getURL()
  } catch {
    // webview not attached yet
  }
}

onMounted(() => {
  const v = view.value
  if (!v) return
  v.addEventListener('did-start-loading', () => {
    loading.value = true
  })
  v.addEventListener('did-stop-loading', () => {
    loading.value = false
    syncState()
  })
  v.addEventListener('did-navigate', syncState)
  v.addEventListener('did-navigate-in-page', syncState)
})

function openSite(id: SiteId) {
  currentSite.value = id
  const home = lumenModSites.find((s) => s.id === id)!.home
  view.value?.loadURL(home)
  router.replace(`/store/web/${id}`)
}

function goBack() {
  view.value?.goBack()
}
function goForward() {
  view.value?.goForward()
}
function reload() {
  view.value?.reload()
}
function openExternal() {
  if (currentUrl.value) window.open(currentUrl.value, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.store-web-browser {
  height: calc(100vh - 40px);
}

.browser-toolbar {
  background: var(--color-card-bg);
  backdrop-filter: blur(var(--blur-card));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.site-tab {
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  border: 1px solid transparent;
  transition: all 0.18s ease;
}

.site-tab:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
}

.site-tab.active {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
}

.browser-view {
  border: none;
  background: #fff;
}
</style>
