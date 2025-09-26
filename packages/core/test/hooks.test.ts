import { expect, test, vi } from 'vitest'
import { registerHook } from '@hybridly/core'
import { fakeRouterContext } from './utils'

test('runs the initialized hook', async () => {
	const hook = vi.fn()
	registerHook('initialized', hook)

	await fakeRouterContext({}, false)

	expect(hook).toHaveBeenCalledOnce()
})
