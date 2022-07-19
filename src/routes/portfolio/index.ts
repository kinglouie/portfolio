
import type { EndpointOutput } from '@sveltejs/kit';
export async function get(): Promise<EndpointOutput> {
    const res = await fetch('http://strapi.moon-toon.de/api/portfolio-items?populate=*');
    const data = await res.json();
    const items = data.data;
    return { body: {items}  };
}