<template>
  <div
    class="mc-version-bg"
    @mouseenter="showEdit = true"
    @mouseleave="showEdit = false"
  >
    <!-- Direct video file -->
    <video
      v-if="directVideoUrl"
      :key="directVideoUrl"
      class="mc-version-bg__media"
      :src="directVideoUrl"
      autoplay
      loop
      muted
      playsinline
    />
    <!-- YouTube trailer -->
    <iframe
      v-else-if="youtubeEmbedUrl"
      :key="youtubeEmbedUrl"
      class="mc-version-bg__yt"
      :src="youtubeEmbedUrl"
      frameborder="0"
      allow="autoplay; encrypted-media"
      tabindex="-1"
    />
    <!-- Official Mojang artwork (once loaded) -->
    <img
      v-else-if="imageUrl"
      :key="imageUrl"
      class="mc-version-bg__media mc-version-bg__kenburns"
      :src="imageUrl"
    >
    <!--
      Fallback / loading state: show the animated Minecraft panorama while the
      Mojang artwork is being fetched, or permanently when there is no artwork.
      This ensures there is never a black screen.
    -->
    <MinecraftPanorama
      v-else
      :minecraft-version="minecraftVersion"
    />

    <div class="mc-version-bg__vignette" />

    <!-- Quick background change button (appears on hover) -->
    <transition name="mc-bg-fade">
      <button
        v-if="showEdit"
        class="mc-version-bg__edit-btn"
        title="Cambiar fondo"
        @click.stop="openEditDialog"
      >
        <span class="material-icons" style="font-size:18px">wallpaper</span>
      </button>
    </transition>

    <!-- Quick background change dialog -->
    <v-dialog v-model="editDialog" max-width="480" @click.stop>
      <v-card>
        <v-card-title class="text-sm pt-4 px-4">Fondo para Minecraft {{ major }}</v-card-title>
        <v-card-text class="pb-2">
          <v-text-field
            v-model="editUrl"
            label="URL de YouTube o video mp4/webm"
            placeholder="https://www.youtube.com/watch?v=..."
            variant="outlined"
            density="compact"
            clearable
            autofocus
            hint="Dejar vacio para usar el artwork oficial de Mojang"
            @keydown.enter="saveEdit"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="tonal" @click="saveEdit">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import MinecraftPanorama from '@/components/MinecraftPanorama.vue'
import { lumenVersionVideos } from '@/lumen.config'

const props = defineProps<{ minecraftVersion: string }>()

const major = computed(() => props.minecraftVersion.split('.').slice(0, 2).join('.'))

interface PatchNote {
  version: string
  image?: { url: string }
}

/** User override (Settings -> Appearance) wins over the shipped config */
const overrideKey = computed(() => `lumen.versionVideo.${major.value}`)
const override = ref(localStorage.getItem(overrideKey.value) ?? '')
watch(overrideKey, (k) => {
  override.value = localStorage.getItem(k) ?? ''
})
function onStorage() {
  override.value = localStorage.getItem(overrideKey.value) ?? ''
}
onMounted(() => window.addEventListener('lumen-version-video-changed', onStorage))
onUnmounted(() => window.removeEventListener('lumen-version-video-changed', onStorage))

const configured = computed(() => override.value || lumenVersionVideos[major.value] || '')

const directVideoUrl = computed(() => {
  const v = configured.value
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(v) ? v : ''
})

const youtubeEmbedUrl = computed(() => {
  const v = configured.value
  if (!v || directVideoUrl.value) return ''
  let id = ''
  const watch = v.match(/[?&]v=([\w-]{11})/)
  const short = v.match(/youtu\.be\/([\w-]{11})/)
  const embed = v.match(/embed\/([\w-]{11})/)
  if (watch) id = watch[1]
  else if (short) id = short[1]
  else if (embed) id = embed[1]
  else if (/^[\w-]{11}$/.test(v)) id = v
  if (!id) return ''
  const params = `autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
})

// Official artwork from Mojang patch notes
let patchNotesPromise: Promise<PatchNote[]> | undefined
function getPatchNotes(): Promise<PatchNote[]> {
  if (!patchNotesPromise) {
    patchNotesPromise = fetch('https://launchercontent.mojang.com/v2/javaPatchNotes.json')
      .then((r) => r.json())
      .then((data) => data.entries ?? data ?? [])
      .catch(() => {
        patchNotesPromise = undefined
        return []
      })
  }
  return patchNotesPromise
}

// imageUrl starts empty so MinecraftPanorama shows immediately (no black flash).
// It is set asynchronously once patch notes are fetched.
const imageUrl = ref('')
watch(
  () => props.minecraftVersion,
  async (version) => {
    imageUrl.value = ''
    if (!version) return
    const notes = await getPatchNotes()
    // 1st: exact version match, 2nd: same major.minor, 3rd: same major
    const maj2 = version.split('.').slice(0, 2).join('.')
    const maj1 = version.split('.')[0]
    const exact = notes.find((n) => n.version === version)
    const byMinor = notes.find((n) => n.version?.startsWith(maj2 + '.') || n.version === maj2)
    const byMajor = notes.find((n) => n.version?.startsWith(maj1 + '.') || n.version === maj1)
    const entry = exact ?? byMinor ?? byMajor
    if (entry?.image?.url) {
      imageUrl.value = new URL(entry.image.url, 'https://launchercontent.mojang.com').toString()
    }
  },
  { immediate: true },
)

// Quick edit overlay
const showEdit = ref(false)
const editDialog = ref(false)
const editUrl = ref('')

function openEditDialog() {
  editUrl.value = override.value || lumenVersionVideos[major.value] || ''
  editDialog.value = true
}

function saveEdit() {
  const key = overrideKey.value
  const url = editUrl.value?.trim() ?? ''
  if (url) {
    localStorage.setItem(key, url)
    override.value = url
  } else {
    localStorage.removeItem(key)
    override.value = ''
  }
  window.dispatchEvent(new Event('lumen-version-video-changed'))
  editDialog.value = false
}
</script>

<style scoped>
.mc-version-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.mc-version-bg__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Oversized iframe so the 16:9 video always covers the window */
.mc-version-bg__yt {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100vw, 177.78vh);
  height: max(100vh, 56.25vw);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.mc-version-bg__kenburns {
  animation: lumen-kenburns 45s ease-in-out infinite alternate;
  filter: saturate(1.05);
}

@keyframes lumen-kenburns {
  from { transform: scale(1.05) translate(0, 0); }
  to   { transform: scale(1.18) translate(-1.5%, -2%); }
}

.mc-version-bg__vignette {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.62) 0%, transparent 38%),
    radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}

/* Quick-change edit button */
.mc-version-bg__edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.mc-version-bg__edit-btn:hover {
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
}

.mc-bg-fade-enter-active,
.mc-bg-fade-leave-active {
  transition: opacity 0.18s ease;
}

.mc-bg-fade-enter-from,
.mc-bg-fade-leave-to {
  opacity: 0;
}
</style>