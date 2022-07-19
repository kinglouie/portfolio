


import { cubicOut, cubicInOut, linear } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';
import { assign, is_function } from 'svelte/internal';

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

type ClientRectMap = Map<any, { rect: ClientRect }>;

export function crossfade({ fallback, ...defaults }: CrossfadeParams & {
	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}): [
  (
    node: Element,
    params: CrossfadeParams & {
      key: any;
    }
  ) => () => TransitionConfig,
  (
    node: Element,
    params: CrossfadeParams & {
      key: any;
    }
  ) => () => TransitionConfig
] {
	const to_receive: ClientRectMap = new Map();
	const to_send: ClientRectMap = new Map();

    function flip(node: Element, { from, to }: { from: DOMRect; to: DOMRect }, params: FlipParams = {}): AnimationConfig {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
    
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        console.log('dx:'+from.left);
        console.log('dy:'+from.top);
    
        const {
            delay = 0,
            duration = (d) => Math.sqrt(d) * 120,
            easing = cubicOut
        } = params;
    
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
    
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

	function transition(items: ClientRectMap, counterparts: ClientRectMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: any }) => {
			items.set(params.key, {
				rect: node.getBoundingClientRect()
			});

			return () => {
				if (counterparts.has(params.key) && node.classList.contains('card')) {
					const { rect } = counterparts.get(params.key);
					counterparts.delete(params.key);
					return flip(node, {from: node.getBoundingClientRect(), to: rect});
				}

				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				items.delete(params.key);
				return fallback && fallback(node, params, intro);
			};
		};
	}

	return [
		transition(to_send, to_receive, false),
		transition(to_receive, to_send, true)
	];
}