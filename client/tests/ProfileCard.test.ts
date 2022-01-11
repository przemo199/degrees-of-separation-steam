import {render} from "@testing-library/svelte";
import ProfileCard from "../src/components/ProfileCard.svelte";

describe("ProfileBar", () => {
  test("renders correctly", () => {
    const testProfileData = {
      profileName: "testProfileName",
      realName: "testRealName",
      profileUrl: "testProfileUrl",
      avatarSrc: "testAvatarSrc",
      steamId: "testSteamId",
      lastLogOff: "testLastLogOff",
      userState: 1
    };

    const {getByText, container} = render(ProfileCard, {props: {profileData: testProfileData}});

    expect(getByText(testProfileData.profileName)).toBeInTheDocument();
    expect(getByText(testProfileData.realName)).toBeInTheDocument();
    expect(getByText(new RegExp(testProfileData.steamId, "g"))).toBeInTheDocument();
    expect(container.innerHTML).toContain(testProfileData.profileUrl);
    expect(container.innerHTML).toContain(testProfileData.avatarSrc);
  });
});
