import { build } from 'vite'
import { cp, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const workspaceRoot = path.resolve(projectRoot, '..')
const deploymentRoot = path.join(workspaceRoot, 'deployment')
const siteRoot = path.join(deploymentRoot, 'baota')

await mkdir(deploymentRoot, { recursive: true })
const realWorkspace = await realpath(workspaceRoot)
const realDeployment = await realpath(deploymentRoot)
if (path.relative(realWorkspace, realDeployment) !== 'deployment') {
  throw new Error('Deployment output must remain inside this workspace.')
}

const existing = await lstat(siteRoot).catch((error) => {
  if (error.code !== 'ENOENT') throw error
  return null
})
if (
  existing &&
  (existing.isSymbolicLink() ||
    !existing.isDirectory() ||
    path.relative(realDeployment, await realpath(siteRoot)) !== 'baota')
) {
  throw new Error('Refusing to replace an unexpected deployment path.')
}

// Build first, then replace only the verified generated deployment directory.
await build({ root: projectRoot, base: './' })
await rm(siteRoot, { recursive: true, force: true })
await cp(path.join(projectRoot, 'dist'), siteRoot, { recursive: true })
await cp(
  path.join(projectRoot, 'docs/BAOTA_DEPLOYMENT.md'),
  path.join(deploymentRoot, '宝塔部署说明.md')
)
await cp(
  path.join(projectRoot, 'docs/baota-nginx.conf.example'),
  path.join(deploymentRoot, 'baota-nginx.conf.example')
)
await cp(path.join(projectRoot, 'docs/DELIVERY.md'), path.join(workspaceRoot, '交付说明.md'))

const files = []
async function describe(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) await describe(absolute)
    else {
      const content = await readFile(absolute)
      files.push({
        path: path.relative(siteRoot, absolute).split(path.sep).join('/'),
        bytes: content.length,
        sha256: createHash('sha256').update(content).digest('hex')
      })
    }
  }
}
await describe(siteRoot)
await writeFile(
  path.join(deploymentRoot, 'build-info.json'),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      base: './',
      routing: 'hash',
      files: files.sort((a, b) => a.path.localeCompare(b.path))
    },
    null,
    2
  ) + '\n'
)
console.log(`\n宝塔网站文件：${siteRoot}`)
console.log('上传 baota 文件夹内的全部内容到网站根目录，入口文件为 index.html。')
