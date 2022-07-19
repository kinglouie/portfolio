
import { cubicOut, cubicInOut, linear } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';
import { assign, is_function } from 'svelte/internal';
import gsap  from "gsap";
import { Flip } from "gsap/dist/Flip";

gsap.registerPlugin(Flip);

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

type ElementMap = Map<any, { node: Element }>;

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
	const to_receive: ElementMap = new Map();
	const to_send: ElementMap = new Map();

	function crossfade(from_node: Element, node: Element, params: CrossfadeParams): TransitionConfig {
		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);


        // record the from state (card)
        Flip.fit(node, from_node, {scale: false});
		const state = Flip.getState(node);

        // set the final state (page)
		gsap.set(node, {clearProps: true}); // wipe out all inline stuff so it's in the native state (not scaled)
		gsap.set(node, { top: 0, left: '50%', visibility: "visible", overflow: "hidden"});

        const tl = Flip.from(state, {
			ease: "power2.inOut",
			scale: false,
			onComplete: () => gsap.set(node, {overflow: "auto"}) // to permit scrolling if necessary
		})

		return {
			delay,
			duration: 2000,
			easing,
			tick: t => {
				tl.progress(t);
			}
		};
	}

	function transition(items: ElementMap, counterparts: ElementMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: any }) => {
			items.set(params.key, { node });

			return () => {
				if (counterparts.has(params.key) && node.classList.contains('page')) {
					const from_node = counterparts.get(params.key).node;
					counterparts.delete(params.key);

					return crossfade(from_node, node, params);
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