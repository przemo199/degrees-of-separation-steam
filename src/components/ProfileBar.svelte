<script lang="ts">
  import type {ProfileData} from "../interfaces";

  export let profileData: ProfileData;

  enum UserState {
    0 = "Offline",
    1 = "Online",
    2 = "Busy",
    3 = "Away",
    4 = "Snooze",
    5 = "Looking to trade",
    6 = "Looking to play"
  }
</script>

<a class="profile-bar" href={profileData.profileUrl} target="_blank">
  <img src={profileData.avatarSrc} alt="profile avatar">
  <div class="info-block">
    <h2>{profileData.profileName}</h2>
    {#if profileData.realName}
      <p>{profileData.realName}</p>
    {/if}
    <p>Steam ID: {profileData.steamId}</p>
    <p>User state: {UserState[profileData.userState]}</p>
    <p>Last log off: {new Date(profileData.lastLogOff * 1000).toLocaleString().replace(",", "")}</p>
  </div>
</a>

<style>
  .profile-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    margin: 5px;
    color: rgb(184, 182, 180);
    text-decoration: none;
  }

  .profile-bar * {
    color: rgb(184, 182, 180);
    text-decoration: none;
  }

  .profile-bar:hover * {
    color: rgb(184, 182, 180);
    text-decoration: none;
  }

  .info-block {
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    margin-right: 20px;
    align-self: stretch;
  }
</style>
