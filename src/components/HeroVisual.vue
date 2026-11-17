<script setup>
import { ref } from 'vue'
import { l } from '../i18n/index.js'
const active = ref(2)
const bars = [42, 66, 51, 82, 67, 94, 78]
</script>
<template>
  <div class="hero-visual">
    <div class="visual-top">
      <span class="live-dot"></span> {{ l('把抽象，变得具体', 'MAKING THE ABSTRACT TANGIBLE')
      }}<span class="visual-index">FIG. 01</span>
    </div>
    <svg
      viewBox="0 0 520 340"
      role="group"
      :aria-label="
        l(
          '从数据点到关联，再到图表的可视化过程；点击柱形探索数据',
          'From data points to connections and charts; select a bar to explore'
        )
      "
    >
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".7" fill="#9fbbb1" opacity=".45" />
        </pattern>
        <linearGradient id="mintgrad" x2="0" y2="1">
          <stop stop-color="#8ac9b7" />
          <stop offset="1" stop-color="#cce9dc" />
        </linearGradient>
      </defs>
      <rect width="520" height="340" fill="url(#dots)" />
      <path
        d="M60 229C128 227 91 94 199 109S278 263 359 236 382 93 461 86"
        fill="none"
        stroke="#94b9ab"
        stroke-width="1.2"
        stroke-dasharray="4 5"
      />
      <g transform="translate(18 51) rotate(-7 92 74)">
        <rect width="180" height="143" rx="14" fill="#fff" stroke="#dce9e0" />
        <text x="17" y="25" font-size="13" fill="#6c8079">
          01 / {{ l('发现关联', 'CONNECT THE DOTS') }}
        </text>
        <path d="m41 78 42-30 49 44-50 26-41-40 91 14M83 48l-1 70" stroke="#a7cabc" fill="none" />
        <circle cx="41" cy="78" r="13" fill="#a7d6c4" />
        <circle cx="83" cy="48" r="18" fill="#e8bec8" />
        <circle cx="132" cy="92" r="22" fill="#7bb6a6" />
        <circle cx="82" cy="118" r="9" fill="#e8d6ba" />
      </g>
      <g transform="translate(194 127) rotate(5 135 85)">
        <rect x="0" y="0" width="296" height="174" rx="14" fill="#fff" stroke="#dce9e0" />
        <text x="18" y="28" font-size="13" fill="#6c8079">
          02 / {{ l('看见模式', 'REVEAL THE PATTERN') }}
        </text>
        <g
          v-for="(bar, i) in bars"
          :key="i"
          @click="active = i"
          @keydown.enter="active = i"
          tabindex="0"
          role="button"
          :aria-label="`${l('模拟数值', 'Simulated value')} ${bar}`"
          class="hero-bar"
        >
          <rect
            :x="22 + i * 36"
            :y="145 - bar"
            width="23"
            :height="bar"
            rx="4"
            :fill="active === i ? '#dca5b4' : 'url(#mintgrad)'"
          />
          <text
            v-if="active === i"
            :x="33 + i * 36"
            :y="137 - bar"
            text-anchor="middle"
            font-size="14"
            fill="#8a4f60"
          >
            {{ bar }}
          </text>
        </g>
        <path d="M18 146h258" stroke="#dce9e0" />
      </g>
      <g transform="translate(306 40)">
        <rect width="172" height="52" rx="26" fill="#f4e6e7" stroke="#e8cfd4" />
        <path d="m17 26 5 5 9-11" fill="none" stroke="#986577" stroke-width="1.7" />
        <text x="42" y="31" font-size="15" fill="#805565">
          {{ l('理解，正在发生', 'An insight unfolds') }}
        </text>
      </g>
      <circle cx="62" cy="276" r="24" fill="#e8bec8" opacity=".5" />
      <path d="m56 276 5 5 9-11" stroke="#996779" stroke-width="1.5" fill="none" />
      <path d="m244 53 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#8cba9f" />
    </svg>
    <div class="visual-bottom">
      <span>{{ l('数据', 'DATA') }}</span
      ><i></i><span>{{ l('关联', 'CONNECTION') }}</span
      ><i></i><span>{{ l('洞察', 'INSIGHT') }}</span>
    </div>
  </div>
</template>
