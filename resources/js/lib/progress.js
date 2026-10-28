import { reactive } from 'vue'

/** Top loading bar state (replaces the Nuxt-style $loading component API). */
export const progress = reactive({ percent: 0, show: false, failed: false })

let timer = null
let hideTimer = null

export function startProgress () {
  clearInterval(timer)
  clearTimeout(hideTimer)
  progress.show = true
  progress.failed = false
  progress.percent = 10
  timer = setInterval(() => {
    progress.percent = Math.min(90, progress.percent + Math.random() * 10)
  }, 150)
}

export function finishProgress (failed = false) {
  clearInterval(timer)
  progress.failed = failed
  progress.percent = 100
  hideTimer = setTimeout(() => {
    progress.show = false
    progress.percent = 0
  }, 300)
}
