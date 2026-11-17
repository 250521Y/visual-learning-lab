<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import d3Runtime from 'virtual:d3-runtime'
import { examples } from '../data/examples.js'
import { createRunToken } from '../utils/runToken.js'
import { l, t } from '../i18n/index.js'
import Icon from '../components/Icon.vue'
import ParameterSlider from '../components/ParameterSlider.vue'
const route = useRoute(),
  router = useRouter(),
  editorEl = ref(null),
  frame = ref(null),
  source = ref(''),
  height = ref(410),
  status = ref('idle'),
  error = ref(''),
  copied = ref(false),
  auto = ref(false)
const current = computed(() => examples.find((e) => e.id === route.query.example) || examples[0])
let editor,
  timer,
  watchdog,
  token = '',
  mounted = true
const statusText = computed(
  () =>
    ({
      idle: l('准备就绪', 'Ready'),
      running: l('正在运行…', 'Running…'),
      success: l('运行成功', 'Run succeeded'),
      error: l('运行出错', 'Runtime error'),
      timeout: l('运行未响应，可重建预览', 'No response; rebuild preview')
    })[status.value]
)
const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '17px', backgroundColor: '#fbfcfa', color: '#29433b' },
  '.cm-content': {
    fontFamily: '"Cascadia Code",Consolas,monospace',
    padding: '20px 0',
    minHeight: '390px'
  },
  '.cm-gutters': { backgroundColor: '#f2f6f1', color: '#526a58', border: 'none' },
  '.cm-activeLine': { backgroundColor: '#edf4ed' },
  '.cm-activeLineGutter': { backgroundColor: '#e1eee3' },
  '&.cm-focused': { outline: 'none' }
})
function run() {
  if (!editor) return
  clearTimeout(watchdog)
  clearTimeout(timer)
  status.value = 'running'
  error.value = ''
  try {
    token = createRunToken()
  } catch {
    token = ''
    source.value = ''
    status.value = 'error'
    error.value = l(
      '当前浏览器暂时无法安全运行代码，请更新浏览器后重试。',
      'This browser cannot run code securely right now. Update your browser and try again.'
    )
    return
  }
  const code = JSON.stringify(editor.state.doc.toString()).replace(/</g, '\\u003c')
  const channel = JSON.stringify(token),
    close = '<' + '/script>'
  const runtime = d3Runtime.replaceAll('<' + '/script', '<' + '\\/script')
  source.value = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><style>body{margin:0;padding:16px;background:#fff;color:#263b3a;font:17px system-ui}svg{display:block;width:100%;max-height:100vh}text{fill:#435c53}*{box-sizing:border-box}</style></head><body><div id="vis"></div><script>${runtime}${close}<script>
 let failed=false;
 const report=(state,message='')=>{if(state==='error')failed=true;if(state==='success'&&failed)return;parent.postMessage({channel:${channel},state,message:String(message).slice(0,1600)},'*')};
 addEventListener('error',e=>{e.preventDefault();report('error',e.message+' (line '+e.lineno+')')});
 addEventListener('unhandledrejection',e=>{e.preventDefault();report('error',e.reason?.message||e.reason)});
 try{const result=new Function('d3',${code})(d3);Promise.resolve(result).then(()=>requestAnimationFrame(()=>report('success'))).catch(e=>report('error',e.message))}catch(e){report('error',e.name+': '+e.message)}
 ${close}</body></html>`
  watchdog = setTimeout(() => {
    if (status.value === 'running') status.value = 'timeout'
  }, 5000)
}
function onMessage(e) {
  if (
    e.source !== frame.value?.contentWindow ||
    e.data?.channel !== token ||
    !['success', 'error'].includes(e.data.state)
  )
    return
  clearTimeout(watchdog)
  status.value = e.data.state
  error.value = typeof e.data.message === 'string' ? e.data.message.slice(0, 1600) : ''
}
function load() {
  if (!editor) return
  auto.value = false
  editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: current.value.code } })
  run()
}
async function copy() {
  try {
    await navigator.clipboard.writeText(editor.state.doc.toString())
    copied.value = true
    setTimeout(() => {
      if (mounted) copied.value = false
    }, 1800)
  } catch {
    error.value = l(
      '复制失败，请在编辑器中选择并复制。',
      'Copy failed. Select and copy in the editor.'
    )
  }
}
function selectExample(event) {
  router.replace({ path: '/playground', query: { example: event.target.value } })
}
watch(() => current.value.id, load)
onMounted(() => {
  editor = new EditorView({
    doc: current.value.code,
    extensions: [
      basicSetup,
      javascript(),
      theme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': 'JavaScript code editor' }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && auto.value) {
          clearTimeout(timer)
          timer = setTimeout(run, 900)
        }
      })
    ],
    parent: editorEl.value
  })
  window.addEventListener('message', onMessage)
  run()
})
onBeforeUnmount(() => {
  mounted = false
  editor?.destroy()
  clearTimeout(timer)
  clearTimeout(watchdog)
  window.removeEventListener('message', onMessage)
})
</script>
<template>
  <div class="page-width standard-page">
    <div class="page-intro">
      <div class="eyebrow">FROM UNDERSTANDING TO MAKING</div>
      <h1>
        {{ l('把想法，写成图形', 'Turn an idea into a visual') }}<span class="heading-dot">.</span>
      </h1>
      <p>
        {{
          l(
            '改一组数据，换一种颜色。代码和结果之间，只隔着一次尝试。',
            'Change a dataset. Try a color. There is just one experiment between code and its result.'
          )
        }}
      </p>
    </div>
    <div class="playground-toolbar panel">
      <label class="field inline-field"
        >{{ l('教学案例', 'Teaching example')
        }}<select :value="current.id" @change="selectExample">
          <option v-for="example in examples" :value="example.id" :key="example.id">
            {{ t(example.title) }}
          </option>
        </select></label
      >
      <div class="button-row">
        <label class="check-field"
          ><input type="checkbox" v-model="auto" />{{
            l('自动运行（900ms）', 'Auto-run (900ms)')
          }}</label
        ><button class="btn" @click="copy">
          <Icon name="copy" :size="16" />{{
            copied ? l('已复制', 'Copied') : l('复制代码', 'Copy')
          }}</button
        ><button class="btn" @click="load">
          <Icon name="reset" :size="16" />{{ l('重置示例', 'Reset') }}</button
        ><button class="btn primary" @click="run">
          <Icon name="play" :size="16" />{{ l('运行代码', 'Run code') }}
        </button>
      </div>
    </div>
    <div class="playground-layout">
      <section class="editor-pane panel">
        <div class="pane-title">
          <span><i class="file-dot"></i> sketch.js</span><span>JAVASCRIPT · D3 v7</span>
        </div>
        <div ref="editorEl" class="code-editor" :style="{ height: height + 'px' }"></div>
      </section>
      <section class="preview-pane panel">
        <div class="pane-title">
          <span><span class="live-dot"></span>{{ l('实时预览', 'LIVE PREVIEW') }}</span
          ><button class="text-link" @click="run">
            <Icon name="reset" :size="14" />{{ l('重建预览', 'Rebuild') }}
          </button>
        </div>
        <iframe
          :key="token"
          ref="frame"
          :srcdoc="source"
          sandbox="allow-scripts"
          referrerpolicy="no-referrer"
          :title="l('隔离的 D3 代码预览', 'Isolated D3 code preview')"
          :style="{ height: height + 'px' }"
        ></iframe>
      </section>
    </div>
    <div class="playground-status" role="status" :class="{ error: status === 'error' }">
      <span :class="['status-light', status]"></span>{{ statusText
      }}<code v-if="error">{{ error }}</code
      ><span class="push-right">{{
        l('独立沙箱 · 本地 D3 · 无网络读取', 'ISOLATED SANDBOX · LOCAL D3 · NO NETWORK FETCH')
      }}</span>
    </div>
    <div class="preview-size">
      <ParameterSlider
        v-model="height"
        :min="300"
        :max="750"
        :step="25"
        :label="l('编辑与预览区域高度', 'Editor & preview height')"
        unit="px"
      />
    </div>
    <div class="playground-notes">
      <div class="why-box">
        <strong>{{ t(current.title) }}</strong>
        <p>{{ t(current.description) }}</p>
        <RouterLink
          :to="`/lessons/${current.id === 'join' ? 1 : current.id === 'events' ? 2 : 4}/${current.id === 'bars' ? 'charts' : current.id === 'transition' ? 'scale' : current.id}`"
          >{{ l('阅读关联知识', 'Read the related concept') }} →</RouterLink
        >
      </div>
      <details class="sandbox-notice">
        <summary>
          {{ l('浏览器代码沙箱的范围与限制', 'Browser sandbox scope & limitations') }}
        </summary>
        <p>
          {{
            l(
              '代码在仅允许脚本的独立 iframe 内运行，不拥有同源权限、存储、表单、弹窗或顶层导航权限。D3 随项目内置，CSP 禁止网络读取、嵌套框架与 Worker；父页面核对消息窗口与本次运行标识。',
              'Code runs in a script-only iframe without same-origin, storage, form, popup or top-navigation permissions. D3 is bundled locally. CSP blocks network fetches, nested frames and workers. The parent checks the source window and per-run identifier.'
            )
          }}
        </p>
        <p>
          {{
            l(
              '这是教学环境，不是恶意代码安全评估平台。无限循环或高内存代码仍可能卡住浏览器；超时提示依赖浏览器事件循环，不能强制终止同步脚本。可重建预览，严重卡死时需刷新或关闭页面。',
              'This is a teaching environment, not a hostile-code security platform. Infinite loops or excessive memory can still freeze the browser. Timeout feedback depends on the event loop and cannot forcibly stop synchronous scripts. Rebuild the preview, or reload/close the page after a severe freeze.'
            )
          }}
        </p>
      </details>
    </div>
  </div>
</template>
