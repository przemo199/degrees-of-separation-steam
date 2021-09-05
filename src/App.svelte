<script lang="ts">
  import NavBar from "./components/NavBar.svelte";

  let steamApiKey: string;
  let firstId: string;
  let secondId: string;
  let loading = false;
  let degree = 0;
  let path: string[] = [];

  async function handleClickEvent() {
    if (steamApiKey.length !== 32 && firstId.length !== 17 && secondId.length !== 17) {
      alert("Provided values have incorrect length");
      return;
    }

    loading = true;

    console.log(steamApiKey);
    console.log(firstId);
    console.log(secondId);

    const request = await fetch("/degree", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: steamApiKey, steamId1: firstId, steamId2: secondId})
    });

    const result = await request.json();
    if (result.degree) {
      degree = result.degree;
      path = result.path;
    }

    loading = false;
  }

</script>

<main>
  <NavBar/>

  <div class="inline-label" style="text-align: right">
    <p>Steam API key:</p>
    <p>Steam ID of the first profile:</p>
    <p>Steam ID of the second profile:</p>
  </div>

  <div class="inline">
    <input type="text" bind:value={steamApiKey}>
    <br>
    <input type="text" bind:value={firstId}>
    <br>
    <input type="text" bind:value={secondId}>
  </div>

  <br/>

  <button class="find-button" on:click={handleClickEvent}>Find degree of separation</button>

  <br/>

  {#if loading}
    <h1>Loading...</h1>
  {/if}

  {#if degree && path.length !== 0}
    {"Degree of separation: " + degree}
    <br/>
    {"Path discovered: " + path.join(", ")}
  {/if}

</main>

<style>
  main {
    text-align: center;
    min-width: 600px;
    overflow-x: hidden;
    color: rgb(184, 182, 180);
  }

  .inline {
    display: inline-block;
    text-align: right;
  }

  .inline-label {
    display: inline-block;
  }

  p {
    margin-bottom: 23px;
    margin-right: 10px;
  }

  input {
    color: rgb(233, 233, 233);
    width: 19em;
    background-color: rgb(50, 53, 60);
    border-radius: 3px;
    border: none;
  }

  input:focus {
    outline: none;
  }

  .find-button {
    border: none;
    background-image: linear-gradient(to right, rgb(61, 163, 241) 5%, rgb(36, 96, 208) 60%);
    border-radius: 2px;
    color: rgb(195, 225, 248);
    padding-left: 1em;
    padding-right: 1em;
    cursor: pointer;
  }

  h1 {
    color: rgb(184, 182, 180);
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  /*@media (min-width: 640px) {*/
  /*  main {*/
  /*    max-width: none;*/
  /*  }*/
  /*}*/
</style>