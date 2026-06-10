<template>
  <button
    class="lumen-play-btn"
    :disabled="isValidating || loading"
    :aria-label="`Play with Lumen Client`"
    @click="onClick()"
  >
    <span class="lumen-play-btn__glow" aria-hidden="true" />

    <!-- Lumen icon -->
    <svg class="lumen-play-btn__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="2.5" width="6" height="2.2" rx="1.1" fill="currentColor"/>
      <rect x="0" y="7" width="4.8" height="2.2" rx="1.1" fill="currentColor" opacity="0.72"/>
      <rect x="0" y="11.5" width="3.6" height="2.2" rx="1.1" fill="currentColor" opacity="0.48"/>
      <path d="M13 4.5L18.5 7.5L13 10.5L7.5 7.5Z" fill="currentColor"/>
      <path d="M18.5 7.5V13.5L13 16.5V10.5Z" fill="currentColor" opacity="0.62"/>
      <path d="M7.5 7.5V13.5L13 16.5V10.5Z" fill="currentColor" opacity="0.8"/>
    </svg>

    <span class="lumen-play-btn__labels">
      <span class="lumen-play-btn__play">
        <span v-if="loading">
          <v-progress-circular indeterminate :size="12" :width="2" class="mr-1" />
        </span>
        {{ loading ? t('launch.cancel') : t('launch.launch') }}
      </span>
      <span class="lumen-play-btn__sub">Lumen Client · Meteor</span>
    </span>
  </button>
</template>

<script lang="ts" setup>
import { kLaunchButton } from '@/composables/launchButton'
import { kInstances } from '@/composables/instances'
import { injection } from '@/util/inject'

const { onClick, loading } = injection(kLaunchButton)
const { isValidating } = injection(kInstances)
const { t } = useI18n()
</script>

<style scoped>
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
