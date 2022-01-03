<script lang="ts">
  import {onMount} from "svelte";
  import ProfileBar from "./ProfileBar.svelte";

  export let apiKey: string;
  export let steamIds: string[];

  let request: Promise<Record<string, unknown>> = Promise.reject();

  async function loadProfiles() {
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: apiKey, steamIds: steamIds})
    });

    return response.json();
  }

  onMount(() => {
    request = loadProfiles();
  });
</script>

<div class="container">
  {#await request}
    <p>Loading...</p>
  {:then profilesData}
    {#each profilesData as profileData}
      <ProfileBar {profileData} />
    {/each}
  {:catch error}
    {#if error}
      {`Oops, something went wrong: ${error.message}`}
    {/if}
  {/await}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }
</style>
