<script lang="ts">
  import NavBar from "./components/NavBar.svelte";

  let steamApiKey: string;
  let firstId: string;
  let secondId: string;
  let searching = false;
  let response = null;

  async function handleClickEvent() {
    if (!steamApiKey || !firstId || !secondId) {
      alert("You need to provide all the values");
      return;
    }

    if (steamApiKey.length !== 32 && firstId.length !== 17 && secondId.length !== 17) {
      alert("Provided values have incorrect length");
      return;
    }

    searching = true;

    const request = await fetch("/degree", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: steamApiKey, steamId1: firstId, steamId2: secondId})
    });

    response = await request.json();

    searching = false;
  }
</script>

<main>
  <NavBar/>

  <div class="inline-label" style="text-align: right">
    <p class="label">Steam API key:</p>
    <p class="label">Steam ID of the first profile:</p>
    <p class="label">Steam ID of the second profile:</p>
  </div>

  <div class="inline">
    <input type="text" bind:value={steamApiKey}>
    <br/>
    <input type="text" bind:value={firstId}>
    <br/>
    <input type="text" bind:value={secondId}>
  </div>

  <br/>

  <button class="find-button" on:click={handleClickEvent}>Find degree of separation</button>

  <br/>
  <br/>

  {#if searching}
    <div class="background">
      <h1>Searching...</h1>
    </div>
  {/if}

  {#if response !== null && !searching}
    <div class="background">
      <p>
        {"Degree of separation: " + (response.degreeOfSeparation === null ? "not found" : response.degreeOfSeparation)}
      </p>
      <p>
        {"Path discovered: " + (response.path === null ? "not found" : response.path)}
      </p>
      <p>
        {"Requests done: " + response.requestsDone}
      </p>
      <p>
        {"Unique profiles fetched: " + response.uniqueProfilesFetched}
      </p>
      <p>
        {"Search duration: " + response.searchDuration/1000 + "s"}
      </p>
      {#if response.tooManyRequests === true}
        <p>
          Daily limit of requests have been exhausted
        </p>
      {/if}
    </div>
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

  .background {
    background-color: rgb(14,20,28);
    display: inline-block;
    padding: 12px;
    text-align: left;
    margin: 10px;
  }

  .label {
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