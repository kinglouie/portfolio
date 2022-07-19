
import type { EndpointOutput } from '@sveltejs/kit';
export async function get({ params }): Promise<EndpointOutput> {
    const res = await fetch(`http://strapi.moon-toon.de/api/portfolio-items?filters[slug][$eq]=${params.uid}&populate=*`);
    const data = await res.json();
    const item = data.data[0];
    return { body: {item}  };
}