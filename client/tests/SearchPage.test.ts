import {render} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import SearchPage from "../src/components/SearchPage.svelte";

describe("MainPage", () => {
  test("has search form", () => {
    const {container} = render(SearchPage);
    expect(container.innerHTML).toContain("form-container");
  });

  test("has search button", () => {
    const {container} = render(SearchPage);
    expect(container.innerHTML).toContain("find-button");
  });

  test("search button handles click when the form is not filled correctly", () => {
    const {getByText} = render(SearchPage);
    window.alert = jest.fn().mockImplementation(() => {});
    window.fetch = jest.fn().mockImplementation(() => {});
    const searchButton = getByText("Find degree of separation");
    searchButton.click();
    expect(window.alert).toHaveBeenCalled();
    expect(window.fetch).not.toHaveBeenCalled();
    delete window.alert;
    delete window.fetch;
  });

  test("search button handles click correctly when form is filled", async () => {
    const {getByText, getByLabelText} = render(SearchPage);
    const apiKeyInput = getByLabelText("Steam API key:");
    const steamId1Input = getByLabelText("Steam ID of the first profile:");
    const steamId2Input = getByLabelText("Steam ID of the second profile:");
    const steamApiKeyMock = new Array(32 + 1).join("a");
    userEvent.type(apiKeyInput, steamApiKeyMock);
    userEvent.type(steamId1Input, "b");
    userEvent.type(steamId2Input, "c");
    await new Promise((r) => setTimeout(r, 100));
    window.alert = jest.fn().mockImplementation(() => {});
    window.fetch = jest.fn().mockImplementation(() => {});
    const searchButton = getByText("Find degree of separation");
    searchButton.click();
    expect(window.alert).not.toHaveBeenCalled();
    expect(window.fetch).toHaveBeenCalled();
    delete window.alert;
    delete window.fetch;
  });
});
