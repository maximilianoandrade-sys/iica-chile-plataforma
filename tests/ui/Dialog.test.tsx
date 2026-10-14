import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Dialog } from "@/components/ui/Dialog";

describe("Dialog", () => {
  it("no renderiza cuando open=false", () => {
    render(<Dialog open={false} onClose={jest.fn()} title="Test"><p>Content</p></Dialog>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tiene role=dialog y aria-modal=true", () => {
    render(<Dialog open onClose={jest.fn()} title="Test"><p>Content</p></Dialog>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("cierra con Escape", () => {
    const onClose = jest.fn();
    render(<Dialog open onClose={onClose} title="Test"><p>Content</p></Dialog>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cierra al hacer clic en backdrop", () => {
    const onClose = jest.fn();
    render(<Dialog open onClose={onClose} title="Test"><p>Content</p></Dialog>);
    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("tiene aria-labelledby vinculado al titulo", () => {
    render(<Dialog open onClose={jest.fn()} title="Mi Modal"><p>Content</p></Dialog>);
    const dialog = screen.getByRole("dialog");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(document.getElementById(titleId!)).toHaveTextContent("Mi Modal");
  });

  it("boton cerrar tiene aria-label", () => {
    render(<Dialog open onClose={jest.fn()} title="Test"><p>Content</p></Dialog>);
    expect(screen.getByLabelText("Cerrar")).toBeInTheDocument();
  });

  it("atrapa el foco y lo devuelve al elemento que abrio el dialogo", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const onClose = jest.fn();

    render(<Dialog open onClose={onClose} title="Test"><button>Accion</button></Dialog>);

    await waitFor(() => expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement));
    const closeButton = screen.getByLabelText("Cerrar");
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Accion" }));

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
    opener.remove();
  });
});
