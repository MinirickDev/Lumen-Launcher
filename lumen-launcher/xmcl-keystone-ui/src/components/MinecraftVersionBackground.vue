<template>
  <div class="mc-version-bg">
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
    <!-- Official Mojang artwork of the exact version -->
    <img
      v-else-if="imageUrl"
      :key="imageUrl"
      class="mc-version-bg__media mc-version-bg__kenburns"
      :src="imageUrl"
    >
    <div v-else class="mc-version-bg__fallback" />

    <div class="mc-version-bg__vignette" />
  </div>
</template>

<script lang="ts" setup>
import { lumenVersionVideos } from '@/lumen.config'

const props = defineProps<{ minecraftVersion: string }>()

const major = computed(() => props.minecraftVersion.split('.').slice(0, 2).join('.'))

interface PatchNote {
  version: string
  image?: { url: string }
}

/** User override (Settings → Appearance) wins over the shipped config */
const overrideKey = computed(() => `lumen.versionVideo.${major.value}`)
const override = ref(localStorage.getItem(overrideKey.value) ?? '')
watch(overrideKey, (k) => {
  override.value = localStorage.getItem(k) ?? ''
})
// Pick up changes written from the appearance settings in the same window
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

// ── Official artwork fallback (launchercontent.mojang.com) ──
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

const imageUrl = ref('')
watch(
  () => props.minecraftVersion,
  async (version) => {
    if (!version) return
    const notes = await getPatchNotes()
    const exact = notes.find((n) => n.version === version)
    const close = notes.find((n) => n.version?.startsWith(major.value))
    const entry = exact ?? close
    imageUrl.value = entry?.image?.url
      ? new URL(entry.image.url, 'https://launchercontent.mojang.com').toString()
      : ''
  },
  { immediate: true },
)
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
  from {
    transform: scale(1.05) translate(0, 0);
  }
  to {
    transform: scale(1.18) translate(-1.5%, -2%);
  }
}

.mc-version-bg__fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(60, 80, 60, 0.55), transparent 60%),
    radial-gradient(ellipse at 75% 80%, rgba(40, 50, 80, 0.5), transparent 65%),
    #07090c;
}

/* Keep the UI readable on top of any artwork */
.mc-version-bg__vignette {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.62) 0%, transparent 38%),
    radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}
</style>
