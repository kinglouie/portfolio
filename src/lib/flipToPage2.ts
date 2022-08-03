
import { cubicOut, cubicInOut, linear } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';
import { assign, is_function } from 'svelte/internal';
// import { gsap }  from "gsap";
// import ScrollToPlugin from "gsap/dist/ScrollToPlugin";

// gsap.registerPlugin(ScrollToPlugin);

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
		console.log('flipToPageNative -> node is animated')
		// console.log(node)
		
		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		node.style.position = 'fixed';
		const border_radius = parseInt(getComputedStyle(from_node).borderRadius);
		node.style.borderRadius = border_radius+'px';
		console.log(node.style.borderRadius)

		const style = getComputedStyle(node);
		const from = from_node.getBoundingClientRect();
		const to = node.getBoundingClientRect();
		const transform = style.transform === 'none' ? '' : style.transform;

		const dx = (from.left - to.left);
		const dy = (from.top - to.top);

		return {
			delay,
			duration,
			easing,
			tick: (t) => {
				if(t==1) {
					window.scrollTo(0, 0);
					window.setTimeout(()=>{
						node.style.position = 'absolute';
					},50);
					
				}
			},
			css: (t, u) => {
				const br = u * border_radius;
				const x = u * dx;
				const y = u * dy;
				const sx = from.width + t * (to.width - from.width);
				const sy = from.height + t * (to.height - from.height);
	
				return `transform: ${transform} translate(${x}px, ${y}px);width: ${sx}px;height: ${sy}px;border-radius: ${br}px`;
			}
		};
	}

	function flipToCard(from_node: Element, node: Element, params: CrossfadeParams): TransitionConfig {
		console.log('flipToCardNative -> from_node is animated')
		console.log(from_node)

		let delay = 0;
		const {
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		// if(window.scrollY > 0) {
		// 	let tl = gsap.timeline({
		// 		onComplete: function(){ 
		// 			from_node.style.position = 'fixed';
		// 		}
		// 	});
		// 	tl.to(window, {duration: 1, scrollTo: from_node});
		// 	delay = 1000;
		// } else {
		// 	from_node.style.position = 'fixed';
		// }
		from_node.style.position = 'fixed';

		let from = from_node.getBoundingClientRect();
		const to = node.getBoundingClientRect();

		// Reposition from node to absolute and move it on the same spot as in fixed position
		from_node.style.overflow = 'hidden';
		from_node.style.position = 'absolute';
		from_node.style.top = '0';
		from_node.style.left = '0';

		const tmp_style = getComputedStyle(from_node);
		const tmp_transform = tmp_style.transform === 'none' ? '' : tmp_style.transform;
		const x_off = parseFloat(tmp_transform.match(/(-?[0-9\.]+)/g)[4]);
		const tmp = from_node.getBoundingClientRect();
		const tdx = from.left - tmp.left + x_off;
		const tdy = from.top - tmp.top;
		from_node.style.transform = `translate(${tdx}px, ${tdy}px)`;
		// debugger;

		// calculate from absolute to target
		from = from_node.getBoundingClientRect();
		const style = getComputedStyle(from_node);
		const transform = style.transform === 'none' ? '' : style.transform;
		const dx = to.left - from.left;
		const dy = to.top - from.top;

		return {
			delay,
			duration,
			easing,
			css: (t, u) => {
				const x = u * dx;
				const y = u * dy;
				const sx = from.width + u * (to.width - from.width);
				const sy = from.height + u * (to.height - from.height);
	
				return `transform: ${transform} translate(${x}px, ${y}px);width: ${sx}px;height: ${sy}px;`;
			}
		};
	}

	function flipToPageBuddy(node, params) {
		console.log('flipToPageBuddy')

		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		return {
			delay: 0,
			duration: 10,
			css: t => `
              opacity: ${(t)}
          	`
		};
	}

	function flipToCardBuddy(node, params) {
		console.log('flipToCardBuddy')

		const {
			delay = 0,
			duration = d => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);

		return {
			delay: (duration-100),
			duration: 100,
			css: t => `
              opacity: ${(t)}
          	`
		};
	}

	function fadeHalf(node, params) {
		console.log('fadeHalf')
		
		return {
			delay: 0,
			duration: 2500,
			css: t => `
              opacity: ${(t)}
          	`
		};
	}


	function transition(items: ElementMap, counterparts: ElementMap, intro: boolean) {
		return (node: Element, params: CrossfadeParams & { key: any }) => {
			items.set(params.key, { node });

			return () => {
				if (counterparts.has(params.key)) {
					const from_node = counterparts.get(params.key).node;
					counterparts.delete(params.key);
					if(node.classList.contains('page') && intro) {
						return flipToPage(from_node, node, params);
					} 
					else if(from_node.classList.contains('card') && !intro) {
						return flipToCard(node, from_node, params);
					} 
					else if (node.classList.contains('card') && intro) {
						return flipToCardBuddy && flipToCardBuddy(from_node, params);
					}
					else if (from_node.classList.contains('page') && !intro) {
						return flipToPageBuddy && flipToPageBuddy(from_node, params);
					}
				}

				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				items.delete(params.key);
				return fadeHalf && fadeHalf(node, params);
			};
		};
	}

	return [
		transition(to_send, to_receive, false),
		transition(to_receive, to_send, true)
	];
}