
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

export function flipToPage({ fallback, ...defaults }: CrossfadeParams & {
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

	function flipToPage(from_node: Element, node: Element, params: CrossfadeParams): TransitionConfig {
		console.log('flipToPage')
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
		gsap.set(node, { top: 0, left: '50%', overflow: "hidden"});

        const tl = Flip.from(state, {
			ease: "power2.inOut",
			scale: false,
			onComplete: () => gsap.set(node, {overflow: "auto"}) // to permit scrolling if necessary
		})

		return {
			delay,
			duration: duration,
			easing,
			tick: t => {
				tl.progress(t);
			}
		};
	}

	function flipToCard(from_node: Element, node: Element, params: CrossfadeParams): TransitionConfig {
		console.log('flipToCard')

		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		gsap.set(from_node, {overflow: "hidden"});
        // record the from state (detail)
		const state = Flip.getState(from_node);
		Flip.fit(from_node, node, {scale: false});
    
        const tl = Flip.from(state, {
			ease: "power2.inOut",
		})

		return {
			delay,
			duration,
			easing,
			tick: t => {
				tl.progress(1-t);
			}
		};
	}

	function transition(items: ElementMap, counterparts: ElementMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: any }) => {
			items.set(params.key, { node });

			return () => {
				if (counterparts.has(params.key)) {
					const from_node = counterparts.get(params.key).node;
					counterparts.delete(params.key);

					if(node.classList.contains('page') && intro)
						return flipToPage(from_node, node, params);
					else if(from_node.classList.contains('card') && !intro)
						return flipToCard(node, from_node, params);
					else 
						return fallback;
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