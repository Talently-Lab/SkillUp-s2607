import { request } from "@/shared/api/http";

export type Teacher = { id: string; name: string };

type ApiUserList = {
  data: { id: string; fullName: string }[];
};

export const adminUsersService = {
  async listTeachers(): Promise<Teacher[]> {
    const { data } = await request<ApiUserList>(
      "/admin/users?role=teacher&limit=50",
      { auth: true },
    );
    return data.map(({ id, fullName }) => ({ id, name: fullName }));
  },
};
