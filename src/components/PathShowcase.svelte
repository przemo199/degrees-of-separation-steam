<script lang="ts">
  import {onMount} from "svelte";
  import ProfileBar from "./ProfileBar.svelte";

  export let steamApiKey: string;
  export let steamIds: string[];

  let request = Promise.resolve();

  onMount(() => {
    async function loadProfiles() {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({apiKey: steamApiKey, steamIds: steamIds})
      });

      return response.json();
    }

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
  {/await}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }
</style>
