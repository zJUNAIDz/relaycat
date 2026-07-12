"use client";

import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useRolesQuery,
  useUpdateRoleMutation,
} from "@/features/role/hooks/role-mutations";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useModal } from "@/shared/hooks/use-modal-store";
import {
  parsePermissions,
  PERMISSION_DETAILS,
  Permission,
  serializePermissions,
  ServerWithMembersAndUser,
  type Role,
} from "@/shared/types";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

const DEFAULT_COLOR = "#99aab5";

/**
 * Editor for a single role. Keyed on the role id by the parent so it re-mounts
 * (and re-initialises its form state) when a different role is selected —
 * avoiding a useEffect to sync props into state.
 */
const RoleEditor = ({
  serverId,
  role,
  onDone,
}: {
  serverId: string;
  role: Role | null; // null = creating a new role
  onDone: () => void;
}) => {
  const isNew = role === null;
  const isDefault = role?.isDefault ?? false;

  const [name, setName] = useState(role?.name ?? "new role");
  const [color, setColor] = useState(role?.color ?? DEFAULT_COLOR);
  const [permissions, setPermissions] = useState<bigint>(
    role ? parsePermissions(role.permissions) : 0n,
  );

  const createMutation = useCreateRoleMutation(serverId);
  const updateMutation = useUpdateRoleMutation(serverId);
  const deleteMutation = useDeleteRoleMutation(serverId);
  const saving = createMutation.isPending || updateMutation.isPending;

  const toggle = (flag: bigint) =>
    setPermissions((prev) => (prev & flag ? prev & ~flag : prev | flag));

  const onSave = () => {
    const payload = {
      name,
      color,
      permissions: serializePermissions(permissions),
    };
    if (isNew) {
      createMutation.mutate(payload, { onSuccess: onDone });
    } else {
      updateMutation.mutate(
        { roleId: role!.id, input: payload },
        { onSuccess: onDone },
      );
    }
  };

  const onDelete = () => {
    if (!role) return;
    deleteMutation.mutate(role.id, { onSuccess: onDone });
  };

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center gap-x-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
          aria-label="Role color"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isDefault}
          placeholder="Role name"
        />
      </div>

      <div className="rounded-md border border-border">
        <ScrollArea className="h-64">
          <div className="divide-y divide-border">
            {PERMISSION_DETAILS.map((detail) => {
              const flag = Permission[detail.key];
              const checked = (permissions & flag) === flag;
              return (
                <label
                  key={detail.key}
                  className="flex cursor-pointer items-start gap-x-3 px-3 py-2 hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(flag)}
                    className="mt-1"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{detail.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {detail.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between">
        {!isNew && !isDefault ? (
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-x-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !name.trim()}>
            {isNew ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ManageRolesModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { server } = data as { server: ServerWithMembersAndUser };
  const isModalOpen = isOpen && type === "manageRoles";
  const serverId = server?.id;

  const { data: roles = [] } = useRolesQuery(serverId, isModalOpen);
  // null = nothing selected; "new" = create form; otherwise a role id.
  const [selected, setSelected] = useState<string | "new" | null>(null);

  const selectedRole =
    selected && selected !== "new"
      ? (roles.find((r) => r.id === selected) ?? null)
      : null;

  const close = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={close}>
      <DialogContent className="overflow-hidden">
        <DialogTitle className="text-center text-2xl font-bold">
          Manage Roles
        </DialogTitle>
        <DialogDescription className="text-center">
          Roles grant permissions to members. Higher roles outrank lower ones.
        </DialogDescription>

        {selected === null ? (
          <div className="flex flex-col gap-y-2 p-2">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => setSelected("new")}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Role
            </Button>
            <ScrollArea className="max-h-80">
              <div className="flex flex-col">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelected(role.id)}
                    className="flex items-center gap-x-2 rounded-md px-3 py-2 text-left hover:bg-accent"
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: role.color ?? DEFAULT_COLOR }}
                    />
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.isDefault && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        default
                      </span>
                    )}
                  </button>
                ))}
                {roles.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No roles yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="p-2">
            {/* key forces a fresh editor (and fresh form state) per selection */}
            <RoleEditor
              key={selected}
              serverId={serverId}
              role={selectedRole}
              onDone={() => setSelected(null)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageRolesModal;
