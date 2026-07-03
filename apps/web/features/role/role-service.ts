import axiosClient from "@/shared/lib/axios-client";
import type {
  CreateRoleInput,
  Role,
  UpdateRoleInput,
} from "@/shared/types";

/**
 * Client for the server-scoped roles API (`/servers/:serverId/roles`). The
 * server enforces MANAGE_ROLES + the position hierarchy; this is a thin wrapper.
 */
class RoleService {
  async list(serverId: string): Promise<Role[]> {
    const {
      data: { roles },
    } = await axiosClient.get(`/servers/${serverId}/roles`);
    return roles;
  }

  async create(serverId: string, input: CreateRoleInput): Promise<Role> {
    const {
      data: { role },
    } = await axiosClient.post(`/servers/${serverId}/roles`, input);
    return role;
  }

  async update(
    serverId: string,
    roleId: string,
    input: UpdateRoleInput,
  ): Promise<Role> {
    const {
      data: { role },
    } = await axiosClient.patch(`/servers/${serverId}/roles/${roleId}`, input);
    return role;
  }

  async remove(serverId: string, roleId: string): Promise<void> {
    await axiosClient.delete(`/servers/${serverId}/roles/${roleId}`);
  }

  async assign(
    serverId: string,
    memberId: string,
    roleId: string,
  ): Promise<void> {
    await axiosClient.post(`/servers/${serverId}/roles/assign`, {
      memberId,
      roleId,
    });
  }

  async unassign(
    serverId: string,
    memberId: string,
    roleId: string,
  ): Promise<void> {
    await axiosClient.post(`/servers/${serverId}/roles/unassign`, {
      memberId,
      roleId,
    });
  }
}

export const roleService = new RoleService();
