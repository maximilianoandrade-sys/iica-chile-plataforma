import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/ui/ToastProvider";

function TestComponent() {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success("Guardado")}>Show Success</button>
      <button onClick={() => toast.error("Falló")}>Show Error</button>
    </>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("muestra toast de success con role=status", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText("Show Success").click();
    });
    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(
      screen.getByText("Guardado").closest('[role="status"]')
    ).toBeInTheDocument();
  });

  it("muestra toast de error con role=alert", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText("Show Error").click();
    });
    expect(screen.getByText("Falló")).toBeInTheDocument();
    expect(
      screen.getByText("Falló").closest('[role="alert"]')
    ).toBeInTheDocument();
  });

  it("throws si useToast se usa fuera del provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useToast must be used within ToastProvider"
    );
    spy.mockRestore();
  });
});
