<script lang="ts">
  import Clock from './Clock.svelte';
</script>

<nav>
  <p>Degrees of separation among Steam users</p>
  <Clock ref="clock" />
</nav>

<style>
  nav {
    width: 100%;
    text-align: left;
    vertical-align: middle;
    color: rgb(198, 212, 223);
    background-color: rgb(23, 26, 33);
    text-transform: uppercase;
    font-size: 1.4em;
    padding: 0.75em;
    margin-bottom: 1em;
  }

  p {
    margin: auto;
    display: inline-block;
  }

  :global([ref=clock]) {
    display: inline-block;
    float: right;
    margin: auto 3% auto auto;
  }
</style>