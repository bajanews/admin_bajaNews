import Link from "next/link";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserListItem } from "@/types/user";

export function UsersTable({ users }: { users: UserListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm" style={{ tableLayout: "fixed" }}>
        <caption className="sr-only">Lista de usuarios</caption>
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--color-line)" }}>
            <th scope="col" className="w-[6%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">#</th>
            <th scope="col" className="w-[24%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Nombre</th>
            <th scope="col" className="w-[30%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Correo</th>
            <th scope="col" className="w-[16%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Rol</th>
            <th scope="col" className="w-[14%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Estatus</th>
            <th scope="col" className="w-[10%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-[var(--color-ink-soft)]">
                No hay usuarios registrados todavía.
              </td>
            </tr>
          )}
          {users.map((user) => {
            const fullName = `${user.profileName} ${user.profileLastName}`.trim();
            const role = user.roles[0];
            return (
              <tr key={user.id} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                <td className="px-4 sm:px-6 py-3 font-tabular text-[var(--color-ink-soft)]">{user.id}</td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {fullName || <span className="text-[var(--color-ink-soft)] italic">Sin nombre</span>}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  <p className="truncate" title={user.email}>{user.email}</p>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">{role ? ROLE_LABELS[role] ?? role : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={
                      user.isEnabled
                        ? { background: "var(--color-success-tint)", color: "var(--color-success)" }
                        : { background: "var(--color-danger-tint)", color: "var(--color-danger)" }
                    }
                  >
                    {user.isEnabled ? "Habilitado" : "Deshabilitado"}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/users/${user.id}`}
                      aria-label={`Ver usuario ${user.email}`}
                      className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/users/${user.id}/edit`}
                      aria-label={`Editar usuario ${user.email}`}
                      className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
