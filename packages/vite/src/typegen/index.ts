import path from 'node:path'
import fs from 'node:fs'
import type { DynamicConfiguration } from '@hybridly/core'
import type { ResolvedOptions } from '../types'
import { debug } from '../utils'

export function generateTsConfig(options: ResolvedOptions, config: DynamicConfiguration) {
	const tsconfig = {
		compilerOptions: {
			target: 'esnext',
			module: 'esnext',
			moduleResolution: 'bundler',
			strict: true,
			jsx: 'preserve',
			sourceMap: true,
			resolveJsonModule: true,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
			lib: [
				'esnext',
				'dom',
			],
			types: [
				'vite/client',
				'hybridly/client',
				...(options.icons !== false ? ['unplugin-icons/types/vue'] : []),
				...(options.tsconfig?.types ?? []),
			],
			baseUrl: '..',
			paths: {
				'#/*': [
					path.resolve(options.laravelPath, '.hybridly/*'),
				],
				'~/*': [
					path.resolve(options.basePath, '*'),
				],
				'@/*': [
					path.resolve(options.laravelPath, config.architecture.root_directory, '*'),
				],
			},
		},
		include: [
			...config.components.views.map(({ path: vuePath }) => path.resolve(options.laravelPath, vuePath)),
			...config.components.layouts.map(({ path: vuePath }) => path.resolve(options.laravelPath, vuePath)),
			...config.components.components.map(({ path: vuePath }) => path.resolve(options.laravelPath, vuePath)),
			path.resolve(options.laravelPath, config.architecture.root_directory, '**', '*'),
			'./php-types.d.ts',
			'./global-properties.d.ts',
			'./routes.d.ts',
			'./components.d.ts',
			'./auto-imports.d.ts',
			...(options.tsconfig?.include ?? []),
		],
		exclude: [
			'../public/**/*',
			...(options.tsconfig?.exclude ?? []),
		],
	}

	write(options, JSON.stringify(tsconfig, null, 2), 'tsconfig.json')
}

export function generateLaravelIdeaHelper(options: ResolvedOptions, config: DynamicConfiguration) {
	const ideJson = {
		$schema: 'https://laravel-ide.com/schema/laravel-ide-v2.json',
		completions: [
			{
				complete: 'staticStrings',
				options: {
					strings: config.components.views.map(({ identifier }) => identifier),
				},
				condition: [
					{
						functionNames: ['hybridly'],
						parameters: [1],
					},
				],
			},
			{
				complete: 'routeName',
				condition: [
					{
						classFqn: ['Hybridly\\Hybridly'],
						methodNames: ['base'],
						parameters: [1],
					},
				],
			},
		],
	}

	write(options, JSON.stringify(ideJson, null, 2), 'ide.json')
}

export function generateRouteDefinitionFile(options: ResolvedOptions, config?: DynamicConfiguration) {
	const routing = config?.routing

	if (!routing) {
		return
	}

	debug.config('Writing types for routing:', routing)

	const routes = Object.fromEntries(Object.entries(routing!.routes).map(([key, route]) => {
		const bindings = route.bindings
			? Object.fromEntries(Object.entries(route.bindings).map(([key]) => [key, '__key_placeholder__']))
			: undefined

		return [key, {
			...(route.uri ? { uri: route.uri } : {}),
			...(route.domain ? { domain: route.domain } : {}),
			...(route.wheres ? { wheres: route.wheres } : {}),
			...(route.bindings ? { bindings } : {}),
		}]
	}))

	const definitions = `
		/* eslint-disable */
		/* prettier-ignore */
		// This file has been automatically generated by Hybridly
		// Modifications will be discarded

		declare module 'hybridly' {
			export interface GlobalRouteCollection {
				url: '__URL__'
				routes: __ROUTES__
			}
		}

		export {}
	`
		.replace('__URL__', routing?.url ?? '')
		.replace('__ROUTES__', JSON.stringify(routes).replaceAll('"__key_placeholder__"', 'any'))

	write(options, definitions, 'routes.d.ts')
}

function write(options: ResolvedOptions, data: any, filename: string) {
	const hybridlyPath = path.resolve(options.laravelPath, '.hybridly')

	if (!fs.existsSync(hybridlyPath)) {
		fs.mkdirSync(hybridlyPath)
	}

	fs.writeFileSync(path.resolve(hybridlyPath, filename), data, {
		encoding: 'utf-8',
	})
}
