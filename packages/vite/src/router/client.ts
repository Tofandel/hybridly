import type { RouteCollection } from '@monolikit/vue'
import { ROUTER_HMR_UPDATE_ROUTE } from '../constants'

/**
* Injects the route collection into the client code.
* When HMR triggers, an event with the new routes is dispatched.
*/
export function getClientCode(routes: RouteCollection) {
	return `
		if (typeof window !== 'undefined') {
			window.monolikit = {
				routes: ${JSON.stringify(routes)}
			}
	
			if (import.meta.hot) {
				import.meta.hot.on('${ROUTER_HMR_UPDATE_ROUTE}', (routes) => {
					window.dispatchEvent(
						new CustomEvent('monolikit:routes', { detail: routes })
					)
				})
			}
		}
 `
}
