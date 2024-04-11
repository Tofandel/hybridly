import type { RouterContext } from '@hybridly/core'
import { debug } from '@hybridly/utils'
import type { ComponentOptions, Ref } from 'vue'
import { ref, shallowRef, triggerRef, unref } from 'vue'

type MaybeRef<T> = Ref<T> | T

export const state = {
	context: shallowRef<RouterContext>(),
	view: shallowRef<ComponentOptions>(),
	properties: ref<GlobalHybridlyProperties>(),
	viewKey: ref<string>(),

	setView(view: MaybeRef<ComponentOptions>) {
		debug.adapter('vue:state:view', 'Storing view:', view)
		state.view.value = view
	},

	setProperties(properties: GlobalHybridlyProperties) {
		debug.adapter('vue:state:view', 'Storing properties:', properties)
		state.properties.value = properties
	},

	setContext(context: MaybeRef<RouterContext>) {
		debug.adapter('vue:state:context', 'Storing context:', context)
		if (unref(context) === state.context.value) {
			triggerRef(state.context)
		} else {
			state.context.value = unref(context)
		}
	},

	setViewKey(key: MaybeRef<string>) {
		debug.adapter('vue:state:key', 'Storing view key:', key)
		state.viewKey.value = unref(key)
	},
}
