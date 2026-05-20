import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza con texto", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeInTheDocument();
  });

  it("muestra spinner y aria-busy en loading", () => {
    render(<Button loading>Enviando</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("aplica variante primary", () => {
    render(<Button variant="primary">CTA</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-xl");
    expect(btn.className).toContain("shadow-lg");
  });

  it("forward ref funciona", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
