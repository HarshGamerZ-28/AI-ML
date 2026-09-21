const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Member = {
  id: number; name: string; role: string; branch?: string; year?: string;
  bio?: string; skills?: string; email?: string; github_url?: string;
  linkedin_url?: string; is_core: boolean; is_admin: boolean; created_at: string;
};

export type ScheduleItem = { id: number; time_label: string; title: string; order: number };

export type EventItem = {
  id: number; slug: string; title: string; description?: string; event_date: string;
  location?: string; status: string; is_featured: boolean; cover_image_url?: string; created_at: string;
};
export type EventDetail = EventItem & { schedule: ScheduleItem[] };

export type GalleryItem = {
  id: number; event_id?: number; type: "image" | "video"; url: string;
  caption?: string; year?: string; created_at: string;
};

export type Achievement = {
  id: number; member_name: string; title: string; description?: string;
  category: string; badge_icon: string; year?: string; status: string; created_at: string;
};

export type Notice = {
  id: number; title: string; body: string; category: string; status: string;
  attachment_url?: string; created_at: string;
};

export type Project = {
  id: number; title: string; description?: string; category: string; tech_stack?: string;
  is_live: boolean; repo_url?: string; demo_url?: string; cover_image_url?: string; created_at: string;
};

export type GalleryBulkResult = { imported: number; skipped: number; items: GalleryItem[] };

export type JoinRequestItem = {
  id: number; name: string; email: string; branch?: string; year?: string;
  interests?: string; message?: string; status: string; created_at: string;
};

export type AdminStats = {
  total_members: number; pending_join_requests: number; pending_achievements: number;
  total_events: number; gallery_count: number; open_notices: number; pending_update_requests: number;
};

export type UpdateRequestItem = {
  id: number; member_id: number; payload_json: string; note?: string; status: string; created_at: string;
};

export type EventRegistration = {
  id: number; event_id: number; name: string; email: string; phone?: string;
  branch?: string; year?: string; created_at: string;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // public reads
  events: (status?: string) => request<EventItem[]>(`/events${status ? `?status=${status}` : ""}`),
  nextEvent: () => request<EventItem | null>(`/events/next`),
  event: (slugOrId: string) => request<EventDetail>(`/events/${slugOrId}`),
  members: () => request<Member[]>(`/members`),
  member: (id: number | string) => request<Member>(`/members/${id}`),
  gallery: (params: { event_id?: number; year?: string; type?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return request<GalleryItem[]>(`/gallery${qs ? `?${qs}` : ""}`);
  },
  achievements: (params: { category?: string; status?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return request<Achievement[]>(`/achievements${qs ? `?${qs}` : ""}`);
  },
  submitAchievement: (payload: Partial<Achievement>) =>
    request<Achievement>(`/achievements`, { method: "POST", body: JSON.stringify(payload) }),
  notices: () => request<Notice[]>(`/notices`),
  notice: (id: number | string) => request<Notice>(`/notices/${id}`),
  projects: (category?: string) => request<Project[]>(`/projects${category ? `?category=${category}` : ""}`),
  submitJoin: (payload: Record<string, string>) =>
    request<JoinRequestItem>(`/join`, { method: "POST", body: JSON.stringify(payload) }),

  // auth
  login: async (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });
    const res = await fetch(`${API_URL}/auth/login`, { method: "POST", body });
    if (!res.ok) throw new Error("Incorrect username or password");
    return res.json() as Promise<{ access_token: string; token_type: string }>;
  },
  me: (token: string) => request(`/auth/me`, {}, token),

  // admin
  stats: (token: string) => request<AdminStats>(`/admin/stats`, {}, token),
  joinRequests: (token: string, status?: string) =>
    request<JoinRequestItem[]>(`/join${status ? `?status=${status}` : ""}`, {}, token),
  updateJoinStatus: (token: string, id: number, status: string) =>
    request<JoinRequestItem>(`/join/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token),

  createMember: (token: string, payload: Partial<Member>) =>
    request<Member>(`/members`, { method: "POST", body: JSON.stringify(payload) }, token),
  updateMember: (token: string, id: number, payload: Partial<Member>) =>
    request<Member>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteMember: (token: string, id: number) =>
    request<void>(`/members/${id}`, { method: "DELETE" }, token),

  createEvent: (token: string, payload: any) =>
    request<EventDetail>(`/events`, { method: "POST", body: JSON.stringify(payload) }, token),
  updateEvent: (token: string, id: number, payload: any) =>
    request<EventDetail>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteEvent: (token: string, id: number) =>
    request<void>(`/events/${id}`, { method: "DELETE" }, token),

  uploadGallery: (token: string, form: FormData) =>
    request<GalleryItem>(`/gallery/upload`, { method: "POST", body: form }, token),
  bulkUploadGalleryZip: (token: string, form: FormData) =>
    request<GalleryBulkResult>(`/gallery/bulk-upload`, { method: "POST", body: form }, token),
  bulkUploadGalleryFromUrl: (token: string, payload: { url: string; event_id?: number; year?: string }) =>
    request<GalleryBulkResult>(`/gallery/bulk-from-url`, { method: "POST", body: JSON.stringify(payload) }, token),
  deleteGallery: (token: string, id: number) =>
    request<void>(`/gallery/${id}`, { method: "DELETE" }, token),

  uploadNoticeAttachment: (token: string, form: FormData) =>
    request<{ url: string }>(`/notices/upload-attachment`, { method: "POST", body: form }, token),

  createProject: (token: string, payload: Partial<Project>) =>
    request<Project>(`/projects`, { method: "POST", body: JSON.stringify(payload) }, token),
  updateProject: (token: string, id: number, payload: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteProject: (token: string, id: number) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }, token),

  updateAchievement: (token: string, id: number, payload: Partial<Achievement>) =>
    request<Achievement>(`/achievements/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteAchievement: (token: string, id: number) =>
    request<void>(`/achievements/${id}`, { method: "DELETE" }, token),

  createNotice: (token: string, payload: Partial<Notice>) =>
    request<Notice>(`/notices`, { method: "POST", body: JSON.stringify(payload) }, token),
  updateNotice: (token: string, id: number, payload: Partial<Notice>) =>
    request<Notice>(`/notices/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteNotice: (token: string, id: number) =>
    request<void>(`/notices/${id}`, { method: "DELETE" }, token),

  // member self-service auth
  memberSignup: (payload: { name: string; email: string; password: string; branch?: string; year?: string }) =>
    request<{ access_token: string; member: Member }>(`/member-auth/signup`, {
      method: "POST", body: JSON.stringify(payload),
    }),
  memberLogin: (email: string, password: string) =>
    request<{ access_token: string; member: Member }>(`/member-auth/login`, {
      method: "POST", body: JSON.stringify({ email, password }),
    }),
  memberMe: (token: string) => request<Member>(`/member-auth/me`, {}, token),

  // update requests
  submitUpdateRequest: (token: string, payload: { payload: Record<string, string>; note?: string }) =>
    request<UpdateRequestItem>(`/update-requests`, { method: "POST", body: JSON.stringify(payload) }, token),
  myUpdateRequests: (token: string) => request<UpdateRequestItem[]>(`/update-requests/mine`, {}, token),
  updateRequests: (token: string, status?: string) =>
    request<UpdateRequestItem[]>(`/update-requests${status ? `?status=${status}` : ""}`, {}, token),
  reviewUpdateRequest: (token: string, id: number, status: "approved" | "rejected") =>
    request<UpdateRequestItem>(`/update-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token),

  // event registration (shareable page)
  registerForEvent: (eventId: number, payload: Record<string, string>) =>
    request<EventRegistration>(`/events/${eventId}/register`, { method: "POST", body: JSON.stringify(payload) }),
  eventRegistrations: (token: string, eventId: number) =>
    request<EventRegistration[]>(`/events/${eventId}/registrations`, {}, token),

  // broadcast email
  broadcastEmail: (token: string, subject: string, body: string) =>
    request<{ recipients: number; sent: number; failed: number; configured: boolean; detail?: string }>(
      `/admin/broadcast-email`, { method: "POST", body: JSON.stringify({ subject, body }) }, token
    ),
};

export { API_URL };
