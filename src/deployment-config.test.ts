import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('GitHub Pages deployment configuration', () => {
  it('builds assets with paths that work below the repository URL', () => {
    const viteConfig = readFileSync(resolve('vite.config.ts'), 'utf8')

    expect(viteConfig).toContain("base: './'")
  })

  it('verifies the project before deploying the dist artifact from main', () => {
    const workflow = readFileSync(
      resolve('.github/workflows/deploy-pages.yml'),
      'utf8',
    )

    expect(workflow).toContain('branches:\n      - main')
    expect(workflow).toContain('run: npm run check')
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3')
    expect(workflow).toContain('uses: actions/deploy-pages@v4')
  })
})
