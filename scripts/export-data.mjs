import { mkdir, writeFile } from 'node:fs/promises'
import { csvFormat } from 'd3'
import { rawRows, dailyRows } from '../src/utils/data.js'
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(
  new URL('../public/data/study-records.csv', import.meta.url),
  csvFormat(rawRows) + '\n'
)
await writeFile(
  new URL('../public/data/daily-study.csv', import.meta.url),
  csvFormat(dailyRows.map(({ key, value }) => ({ date: key, minutes: value }))) + '\n'
)
console.log('Exported deterministic teaching simulation CSV files.')
