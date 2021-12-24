<script lang="ts">
  import {onMount} from "svelte";
  import ProfileBar from "./ProfileBar.svelte";

  export let steamApiKey: string;
  export let steamIds: string[];

  let profilesData = [];

  onMount(async () => {
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: steamApiKey, steamIds: steamIds})
    });

    profilesData = await response.json();
  });
</script>

<div>
  {#each profilesData as profileData}
    <ProfileBar {profileData} />
  {/each}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
</style>
