<script lang="ts">
  import {onMount} from "svelte";
  import ProfileBar from "./ProfileBar.svelte";

  export let steamApiKey: string;
  export let steamIds: string[];

  let request = new Promise(() => {});

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

<div>
  {#await request}
    <p>Loading...</p>
  {:then profilesData}
    {#each profilesData as profileData}
      <ProfileBar {profileData} />
    {/each}
  {/await}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
</style>
