import {render} from "@testing-library/svelte";
import Clock from "../src/components/Clock.svelte";

describe("Clock", () => {
  test("shows correct time", () => {
    const {getByText} = render(Clock);
    const time = new Date();
    expect(getByText(time.toLocaleTimeString().toString())).toBeInTheDocument();
  });

  test("time changes correctly", async () => {
    const {getByText} = render(Clock);
    const time = new Date();
    const clockElement = getByText(time.toLocaleTimeString().toString());
    expect(clockElement).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 1500));
    expect(clockElement.innerText).not.toEqual(new Date().toLocaleTimeString().toString());
  });
});
