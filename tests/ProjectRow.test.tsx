import { render, screen } from "@testing-library/react";
import { ProjectRow } from "@/components/ProjectRow";
import type { Project } from "@/lib/data";

// Mock next/link
jest.mock("next/link", () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock logger
jest.mock("@/lib/utils/logger", () => ({
  getLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    nombre: "Programa de Innovación",
    institucion: "CORFO",
    monto: 150_000_000,
    fecha_cierre: "2099-12-31",
    estado: "Publicada",
    categoria: "Innovación",
    url_bases: "https://example.com",
    estadoPostulacion: "Abierta",
    ambito: "Nacional",
    ...overrides,
  } as Project;
}

describe("ProjectRow", () => {
  it("renders project name as link to /proyecto/{id}", () => {
    render(<ProjectRow project={makeProject({ id: 42, nombre: "Test Project" })} />);
    const link = screen.getByRole("link", { name: "Test Project" });
    expect(link).toHaveAttribute("href", "/proyecto/42");
  });

  it("shows institution and ambito in metadata line", () => {
    render(<ProjectRow project={makeProject({ institucion: "ANID", ambito: "Internacional" })} />);
    expect(screen.getByText(/ANID · Internacional/)).toBeInTheDocument();
  });

  it("shows correct status badge", () => {
    render(<ProjectRow project={makeProject({ estadoPostulacion: "Abierta" })} />);
    expect(screen.getByText("Abierta")).toBeInTheDocument();
  });

  it("applies opacity-60 for closed projects", () => {
    const { container } = render(
      <ProjectRow project={makeProject({ estadoPostulacion: "Cerrada" })} />
    );
    const article = container.querySelector("article");
    expect(article?.className).toContain("opacity-60");
  });

  it("formats deadline correctly for future date", () => {
    // Use a date 30 days from now
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const fechaCierre = future.toISOString().slice(0, 10);
    render(<ProjectRow project={makeProject({ fecha_cierre: fechaCierre })} />);
    expect(screen.getByText(/Cierra en/)).toBeInTheDocument();
  });
});
