import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { build } from 'esbuild'

const outputPath = resolve(process.argv[2] ?? 'work/card-artwork-specs.json')
const bundle = await build({
  bundle: true,
  entryPoints: ['src/artwork/pilotSpecs.ts'],
  format: 'esm',
  platform: 'node',
  write: false,
  plugins: [{
    name: 'workspace-alias',
    setup(buildApi) {
      buildApi.onResolve({ filter: /^@\// }, ({ path }) => {
        const base = resolve('src', path.slice(2))
        const resolved = [`${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts'), base]
          .find((candidate) => existsSync(candidate))
        return { path: resolved ?? base }
      })
    },
  }],
})
const encodedBundle = Buffer.from(bundle.outputFiles[0].text).toString('base64')
const {
  createExpansionArtworkSpecs,
  createPilotArtworkSpecs,
  createRemainingArtworkSpecs,
} = await import(`data:text/javascript;base64,${encodedBundle}`)
const mode = process.argv[3] ?? 'pilot'
const specs = mode === 'remaining'
  ? createRemainingArtworkSpecs()
  : mode === 'expansion'
    ? createExpansionArtworkSpecs()
    : createPilotArtworkSpecs()

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(specs, null, 2)}\n`, 'utf8')
process.stdout.write(`${outputPath}\n`)
