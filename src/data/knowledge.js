import { bi } from '../i18n/index.js'
import { chapters, labs } from './course.js'
const prerequisite = {
  dikw: ['data'],
  'scales-data': ['data'],
  encoding: ['scales-data'],
  transform: ['data'],
  join: ['transform'],
  pipeline: ['transform'],
  card: ['pipeline'],
  aggregation: ['transform'],
  tree: ['aggregation'],
  events: ['join'],
  interaction: ['events'],
  hsl: ['encoding'],
  spaces: ['hsl'],
  palettes: ['scales-data', 'hsl'],
  perception: ['palettes'],
  contrast: ['spaces'],
  cvd: ['perception'],
  charts: ['encoding'],
  scale: ['scales-data'],
  coordinates: ['scale'],
  fitting: ['charts', 'scale'],
  slope: ['scale'],
  contour: ['coordinates'],
  time: ['scales-data'],
  trend: ['time', 'charts'],
  calendar: ['palettes', 'time'],
  spiral: ['coordinates', 'time'],
  storyline: ['time'],
  brush: ['events', 'trend']
}
export const nodes = [
  ...chapters.map((c) => ({
    id: `chapter-${c.id}`,
    title: c.title,
    type: 'chapter',
    chapter: c.id,
    description: c.subtitle,
    prerequisites: c.id > 1 ? [`chapter-${c.id - 1}`] : [],
    lessonPath: `/lessons/${c.id}`,
    labPath: `/labs/${c.lab}`
  })),
  ...chapters.flatMap((c) =>
    c.topics.map((p) => ({
      id: p.id,
      title: p.title,
      type: 'topic',
      chapter: c.id,
      description: p.definition,
      prerequisites: prerequisite[p.id] || [],
      lessonPath: `/lessons/${c.id}/${p.id}`,
      labPath: `/labs/${c.lab}`
    }))
  ),
  ...labs.map((l) => ({
    id: `lab-${l.id}`,
    title: l.short,
    type: 'lab',
    chapter: l.chapter,
    description: l.description,
    prerequisites:
      l.id === 'pipeline'
        ? ['pipeline', 'aggregation']
        : l.id === 'comparison'
          ? ['charts', 'encoding']
          : l.id === 'color'
            ? ['palettes', 'contrast']
            : l.id === 'fitting'
              ? ['fitting']
              : l.id === 'time'
                ? ['brush', 'calendar']
                : ['tree', 'contour', 'spiral'],
    lessonPath: `/lessons/${l.chapter}`,
    labPath: `/labs/${l.id}`
  }))
]
const edgeMap = new Map()
const connect = (source, target, type) => {
  const key = [source, target].sort().join('|')
  if (source !== target && !edgeMap.has(key)) edgeMap.set(key, { source, target, type })
}
nodes.forEach((n) => {
  if (n.type !== 'chapter') connect(`chapter-${n.chapter}`, n.id, 'contains')
  n.prerequisites.forEach((p) => connect(p, n.id, 'prerequisite'))
})
export const links = [...edgeMap.values()]
nodes.forEach((n) => {
  n.relatedNodes = links
    .filter((e) => e.source === n.id || e.target === n.id)
    .map((e) => (e.source === n.id ? e.target : e.source))
})
export const nodeTypes = {
  chapter: bi('章节', 'Chapter'),
  topic: bi('知识点', 'Topic'),
  lab: bi('实验', 'Lab')
}
