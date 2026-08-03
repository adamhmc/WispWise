import { DOMAIN_LAYER } from '@/domain'
import { GAME_LAYER } from '@/game'
import { INFRASTRUCTURE_LAYER } from '@/infrastructure'
import { PORTS_LAYER } from '@/ports'
import { UI_LAYER } from '@/ui'

describe('project architecture', () => {
  it('resolves every planned layer through the source alias', () => {
    expect([DOMAIN_LAYER, GAME_LAYER, PORTS_LAYER, INFRASTRUCTURE_LAYER, UI_LAYER]).toEqual([
      'domain',
      'game',
      'ports',
      'infrastructure',
      'ui',
    ])
  })
})
