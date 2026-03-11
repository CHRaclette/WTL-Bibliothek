import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HomePage } from "../src/pages/HomePage";
import "@testing-library/jest-dom";

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });
});

test("shows empty state when no books exist", async () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  expect(screen.getByRole("progressbar")).toBeInTheDocument();

  expect(
    await screen.findByText("Keine Bücher vorhanden")
  ).toBeInTheDocument();
});
