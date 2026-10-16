import Link from "next/link";
import { adminFetch } from "@/lib/adminApi";
import { uploadUrl } from "@/lib/assets";
import { ModuleCard } from "@/components/ModuleCard";
import { FlashBanner } from "@/components/FlashBanner";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { deleteCustomer } from "@/lib/actions/customers";
import type { Customer } from "@/types/customer";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const customers = await adminFetch<Customer[]>("/api/admin/customers");

  return (
    <ModuleCard
      title="Clientes"
      subtitle="Administra los clientes y anunciantes registrados"
      actions={
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
          style={{ background: "var(--color-cta)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo registro
        </Link>
      }
    >
      <FlashBanner ok={ok} error={error} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm" style={{ tableLayout: "fixed" }}>
          <caption className="sr-only">Lista de clientes registrados</caption>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-line)" }}>
              <th scope="col" className="w-[6%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">#</th>
              <th scope="col" className="w-[12%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Imagen</th>
              <th scope="col" className="w-[20%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Nombre</th>
              <th scope="col" className="w-[27%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Organización</th>
              <th scope="col" className="w-[15%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Creado</th>
              <th scope="col" className="w-[20%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-[var(--color-ink-soft)]">
                  No hay clientes registrados todavía.
                </td>
              </tr>
            )}
            {customers.map((customer) => {
              const imgSrc = uploadUrl("customers", customer.image);
              const fullName = `${customer.name} ${customer.lastName}`;
              return (
                <tr key={customer.id} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                  <td className="px-4 sm:px-6 py-3 font-tabular text-[var(--color-ink-soft)]">{customer.id}</td>
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img className="w-16 aspect-video object-cover rounded" src={imgSrc} alt="" />
                    ) : (
                      <div className="w-16 aspect-video rounded" style={{ background: "var(--color-line)" }} aria-hidden="true" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink)]">{fullName}</td>
                  <td className="px-4 py-3 text-[var(--color-ink)]">{customer.organization}</td>
                  <td className="px-4 py-3 font-tabular text-[var(--color-ink-soft)]">
                    {customer.createdAt ? customer.createdAt.slice(0, 10) : ""}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/customers/${customer.id}/edit`}
                        aria-label={`Editar a ${fullName}`}
                        className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <ConfirmDeleteForm
                        action={deleteCustomer.bind(null, customer.id)}
                        confirmMessage={`¿Borrar a ${fullName}? Esta acción no se puede deshacer.`}
                      >
                        <button
                          type="submit"
                          aria-label={`Borrar a ${fullName}`}
                          className="p-2 rounded-md hover:bg-[var(--color-danger-tint)] cursor-pointer"
                          style={{ color: "var(--color-danger)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </ConfirmDeleteForm>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}
