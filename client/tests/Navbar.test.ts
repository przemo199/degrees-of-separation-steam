import {render} from "@testing-library/svelte";
import NavBar from "../src/components/NavBar.svelte";

describe("NavBar", () => {
  test("renders correctly", () => {
    const {container} = render(NavBar);
    expect(container).toBeInTheDocument();
  });

  test("has correct text", () => {
    const {getByText} = render(NavBar);
    expect(getByText("Degrees of separation between Steam users")).toBeInTheDocument();
  });

  test("has clock element", () => {
    const {container} = render(NavBar);
    expect(container.innerHTML).toContain("clock");
  });
});
