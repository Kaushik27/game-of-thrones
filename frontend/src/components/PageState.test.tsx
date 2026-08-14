import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import PageState from "./PageState";

describe("PageState", () => {
  it("exposes an accessible loading status", () => {
    render(<PageState loading error="" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("offers retry for a service failure", () => {
    const retry = vi.fn();
    render(<PageState loading={false} error="The service is unavailable." onRetry={retry} />);
    screen.getByRole("button", { name: "Try again" }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
