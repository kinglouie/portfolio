<script context="module">
    export const prerender = true;
</script>
<script lang="ts">
    import PortfolioItem from '$lib/PortfolioItem.svelte';
    export let item: any;
</script>

<PortfolioItem item={item} />