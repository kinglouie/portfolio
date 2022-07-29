<script context="module">
    export const prerender = true;
</script>
<script lang="ts">
    import PortfolioItem from '$lib/PortfolioItem.svelte';
    export let item: any;
</script>

<div class="container mx-auto">
    <PortfolioItem item={item} />
</div>