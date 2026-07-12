import { roleService } from "@/features/role/role-service";
import type { CreateRoleInput, Role, UpdateRoleInput } from "@/shared/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/** Server roles, cached per server. Drives the role editor + assignment UI. */
export function useRolesQuery(serverId: string, enabled = true) {
  return useQuery({
    queryKey: ["roles", serverId],
    queryFn: () => roleService.list(serverId),
    enabled: !!serverId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Invalidate both the roles list and the server roster (roles are embedded). */
function useRoleInvalidation(serverId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["roles", serverId] });
    queryClient.invalidateQueries({ queryKey: ["server"] });
  };
}

export function useCreateRoleMutation(serverId: string) {
  const invalidate = useRoleInvalidation(serverId);
  return useMutation({
    mutationFn: (input: CreateRoleInput): Promise<Role> =>
      roleService.create(serverId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateRoleMutation(serverId: string) {
  const invalidate = useRoleInvalidation(serverId);
  return useMutation({
    mutationFn: ({
      roleId,
      input,
    }: {
      roleId: string;
      input: UpdateRoleInput;
    }): Promise<Role> => roleService.update(serverId, roleId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRoleMutation(serverId: string) {
  const invalidate = useRoleInvalidation(serverId);
  return useMutation({
    mutationFn: (roleId: string): Promise<void> =>
      roleService.remove(serverId, roleId),
    onSuccess: invalidate,
  });
}

export function useAssignRoleMutation(serverId: string) {
  const invalidate = useRoleInvalidation(serverId);
  return useMutation({
    mutationFn: ({
      memberId,
      roleId,
    }: {
      memberId: string;
      roleId: string;
    }): Promise<void> => roleService.assign(serverId, memberId, roleId),
    onSuccess: invalidate,
  });
}

export function useUnassignRoleMutation(serverId: string) {
  const invalidate = useRoleInvalidation(serverId);
  return useMutation({
    mutationFn: ({
      memberId,
      roleId,
    }: {
      memberId: string;
      roleId: string;
    }): Promise<void> => roleService.unassign(serverId, memberId, roleId),
    onSuccess: invalidate,
  });
}
