<script setup>
defineProps({
  name: { type: String, default: 'chart' },
  size: { type: [Number, String], default: 20 }
})
const paths = {
  chart: 'M4 19V5m0 14h16M8 15V9m5 6V5m5 10v-5',
  database:
    'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3Zm0 0v12c0 2-3.6 3-8 3s-8-1-8-3V6m0 6c0 2 3.6 3 8 3s8-1 8-3',
  network:
    'M12 5 5 16m7-11 7 11M5 16h14M15 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  book: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z',
  flask: 'M9 3h6m-5 0v6L4 19q-1 2 2 2h12q3 0 2-2L14 9V3M7 15h10',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v5l3 2m7-3a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  palette:
    'M12 3a9 9 0 1 0 0 18c2 0 3-1 2-3-1-2 0-3 2-3h2c3 0 3-5 0-8-2-3-4-4-6-4ZM7 8h.01M12 6h.01M17 9h.01M6 13h.01',
  calendar: 'M4 5h16v16H4V5Zm3-3v6m10-6v6M4 11h16m-12 4h.01M12 15h.01M16 15h.01M8 18h.01',
  workflow: 'M3 4h6v6H3V4Zm12 10h6v6h-6v-6ZM9 7h7v7M6 10v7h9',
  curve: 'M3 19V5m0 14h18M5 16C9 0 13 26 20 6',
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2m-3 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  reset: 'M4 10a8 8 0 1 1 0 5M4 4v6h6',
  globe:
    'M3 12h18M12 2a18 18 0 0 1 0 20 18 18 0 0 1 0-20Zm10 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
  play: 'm8 4 12 8-12 8V4Z',
  copy: 'M8 8h13v13H8V8ZM4 16H3V3h13v1',
  info: 'M12 11v6m0-10h.01m10 5a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
  target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5-1v2',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'
}
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.chart" />
  </svg>
</template>
