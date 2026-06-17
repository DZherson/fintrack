import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { Category } from "@prisma/client";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Alimentación",
    icon: "🍔",
    color: "#f97316",
    isDefault: true,
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat-2",
    name: "Transporte",
    icon: "🚗",
    color: "#3b82f6",
    isDefault: true,
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("TransactionForm", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderForm() {
    return render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );
  }

  it("renders all required fields", () => {
    renderForm();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderForm();

    const submitButton = screen.getByRole("button", { name: /guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el monto debe ser un número/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/la categoría es requerida/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it("renders submit button with loading state when isSubmitting is true", () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />,
    );

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });

  it("shows 'Actualizar' button text when editing existing transaction", () => {
    render(
      <TransactionForm
        categories={mockCategories}
        defaultValues={{ id: "tx-existing" } as Parameters<typeof TransactionForm>[0]["defaultValues"]}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();
  });
});
