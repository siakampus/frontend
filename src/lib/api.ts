/**
 * Centralized API Client
 * Base URL: http://localhost:8000 (proxied via Vite in dev)
 * All calls use `credentials: "include"` for session cookies
 * and optionally `Authorization: Bearer <token>` from localStorage.
 */

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return { ...base, ...extra };
}

function authHeadersMultipart(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = {};
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

// In dev: empty string — Vite proxy handles /api/*, /auth/*, etc.
// In production: set VITE_PUBLIC_API_URL in Vercel env vars to your backend URL.
const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: data as T };
}

// ─────────────────────────────────────────────
// Auth — OTP / Verification / Password Reset
// ─────────────────────────────────────────────

export const authApi = {
  /** POST /auth/request-verification — Request OTP before sign-up */
  requestVerification: (email: string) =>
    apiFetch("/auth/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  /** POST /auth/verify-code — Verify OTP code */
  verifyCode: (email: string, code: string) =>
    apiFetch("/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }),

  /** POST /auth/request-student-verification — Request student OTP (auth required) */
  requestStudentVerification: () =>
    apiFetch("/auth/request-student-verification", {
      method: "POST",
      headers: authHeaders(),
    }),

  /** POST /auth/verify-student — Verify student OTP (auth required) */
  verifyStudent: (code: string) =>
    apiFetch("/auth/verify-student", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ code }),
    }),

  /** POST /auth/forgot-password — Send password reset email */
  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  /** POST /auth/reset-password — Reset password with token */
  resetPassword: (token: string, newPassword: string) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    }),

  /** POST /auth/upgrade-to-student — Upgrade account role to student (auth required) */
  upgradeToStudent: () =>
    apiFetch("/auth/upgrade-to-student", {
      method: "POST",
      headers: authHeaders(),
    }),

  /** POST /auth/registration/section/1/save — Save extra fields after sign-up (BetterAuth session) */
  saveRegistrationData: (payload: Record<string, unknown>) =>
    apiFetch("/auth/registration/section/1/save", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** GET /auth/profile — Get current user profile (auth required) */
  getProfile: () =>
    apiFetch("/auth/profile", {
      headers: authHeaders(),
    }),

  // ── Student Registration ──

  /** GET /auth/student-registration/data — Get student registration data */
  getStudentRegistrationData: () =>
    apiFetch("/auth/student-registration/data", {
      headers: authHeaders(),
    }),

  /** GET /auth/student-registration/result — Get registration result */
  getStudentRegistrationResult: () =>
    apiFetch("/auth/student-registration/result", {
      headers: authHeaders(),
    }),

  /** POST /auth/student-registration/section/:sectionId — Save a registration section */
  saveStudentRegistrationSection: (sectionId: string, payload: Record<string, unknown>) =>
    apiFetch(`/auth/student-registration/section/${sectionId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  // ── Registration Form Sections ──

  /** GET /auth/registration/sections — Get all registration sections */
  getRegistrationSections: () =>
    apiFetch("/auth/registration/sections", {
      headers: authHeaders(),
    }),

  /** GET /auth/registration/section/:sectionId — Get a section by ID */
  getRegistrationSection: (sectionId: string) =>
    apiFetch(`/auth/registration/section/${sectionId}`, {
      headers: authHeaders(),
    }),

  /** GET /auth/registration/formatted-data — Get formatted registration data */
  getFormattedRegistrationData: () =>
    apiFetch("/auth/registration/formatted-data", {
      headers: authHeaders(),
    }),

  /** POST /auth/registration/section/:sectionId/subsection/:subsectionId/save */
  saveSubsectionById: (sectionId: string, subsectionId: string, payload: Record<string, unknown>) =>
    apiFetch(`/auth/registration/section/${sectionId}/subsection/${subsectionId}/save`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** POST /auth/registration/section/:sectionId/subsection/name/:subsectionName/save */
  saveSubsectionByName: (sectionId: string, subsectionName: string, payload: Record<string, unknown>) =>
    apiFetch(`/auth/registration/section/${sectionId}/subsection/name/${subsectionName}/save`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** POST /auth/registration/section/:sectionId/save — Save full section */
  saveFullSection: (sectionId: string, payload: Record<string, unknown>) =>
    apiFetch(`/auth/registration/section/${sectionId}/save`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),
};

// ─────────────────────────────────────────────
// User Profile Management
// ─────────────────────────────────────────────

export const userApi = {
  /** GET /user/profile — Get logged-in user's full profile */
  getProfile: () =>
    apiFetch("/user/profile", {
      headers: authHeaders(),
    }),

  /** PUT /user/phone — Update phone number */
  updatePhone: (phone: string) =>
    apiFetch("/user/phone", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ phone }),
    }),

  /** POST /user/profile-picture — Upload profile picture (multipart, field: profilePicture) */
  uploadProfilePicture: (file: File) => {
    const form = new FormData();
    form.append("profilePicture", file);
    return apiFetch("/user/profile-picture", {
      method: "POST",
      headers: authHeadersMultipart(),
      body: form,
    });
  },

  /** GET /user/profile-picture — Get profile picture */
  getProfilePicture: () =>
    apiFetch("/user/profile-picture", {
      headers: authHeaders(),
    }),

  /** DELETE /user/profile-picture — Delete profile picture */
  deleteProfilePicture: () =>
    apiFetch("/user/profile-picture", {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admission / Personal Data
// ─────────────────────────────────────────────

export const admissionDataApi = {
  /** GET /admissiondata/locked — Check personal data lock status */
  getLockStatus: () =>
    apiFetch("/admissiondata/locked", {
      headers: authHeaders(),
    }),

  /** GET /admissiondata/:type — Get personal data by type */
  getByType: (type: string) =>
    apiFetch(`/admissiondata/${type}`, {
      headers: authHeaders(),
    }),

  /** PUT /admissiondata/lock — Lock personal data */
  lock: () =>
    apiFetch("/admissiondata/lock", {
      method: "PUT",
      headers: authHeaders(),
    }),

  /** PUT /admissiondata/unlock — Unlock personal data */
  unlock: () =>
    apiFetch("/admissiondata/unlock", {
      method: "PUT",
      headers: authHeaders(),
    }),

  /** PUT /admissiondata/:type — Update personal data (multipart: kk_file, ktp_file optional) */
  updateByType: (
    type: string,
    payload: Record<string, unknown>,
    files?: { kk_file?: File; ktp_file?: File }
  ) => {
    if (files && (files.kk_file || files.ktp_file)) {
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
      if (files.kk_file) form.append("kk_file", files.kk_file);
      if (files.ktp_file) form.append("ktp_file", files.ktp_file);
      return apiFetch(`/admissiondata/${type}`, {
        method: "PUT",
        headers: authHeadersMultipart(),
        body: form,
      });
    }
    return apiFetch(`/admissiondata/${type}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  },

  /** POST /admissiondata/generate-pdf — Generate PDF from personal data */
  generatePdf: () =>
    apiFetch("/admissiondata/generate-pdf", {
      method: "POST",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admission Paths
// ─────────────────────────────────────────────

export const admissionPathsApi = {
  /** GET /admission-paths/active — Get active admission paths (no auth required) */
  getActive: () => apiFetch("/admission-paths/active"),

  /** POST /admission-paths/select — Select an admission path */
  select: (admissionPathId: number | string) =>
    apiFetch("/admission-paths/select", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ admissionPathId }),
    }),

  /** GET /admission-paths/selected — Get currently selected path */
  getSelected: () =>
    apiFetch("/admission-paths/selected", {
      headers: authHeaders(),
    }),

  /** GET /admission-paths/ — List all admission paths (Admin, paginated) */
  listAll: (params?: { skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/admission-paths/?${q}`, {
      headers: authHeaders(),
    });
  },

  /** PUT /admission-paths/{id} — Admin: update admission path */
  update: (
    id: number | string,
    payload: {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status?: "ACTIVE" | "INACTIVE";
    }
  ) =>
    apiFetch(`/admission-paths/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /admission-paths/{id} — Admin: delete admission path */
  delete: (id: number | string) =>
    apiFetch(`/admission-paths/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** PATCH /admission-paths/{id}/status — Admin: toggle ACTIVE / INACTIVE */
  toggleStatus: (id: number | string, status: "ACTIVE" | "INACTIVE") =>
    apiFetch(`/admission-paths/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }),

  /** POST /admission-paths/ — Admin: create a new admission path */
  createPath: (payload: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status?: "ACTIVE" | "INACTIVE";
  }) =>
    apiFetch("/admission-paths/", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),
};

// ─────────────────────────────────────────────
// File Management  (/api/files/)
// ─────────────────────────────────────────────

export const filesApi = {
  /** POST /api/files/upload — Upload a file (multipart, field: file) */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/files/upload", {
      method: "POST",
      headers: authHeadersMultipart(),
      body: form,
    });
  },

  /** GET /api/files/:fileId — Returns the direct URL (no auth needed) */
  getFileUrl: (fileId: string) => `/api/files/${fileId}`,

  /** DELETE /api/files/:fileId — Delete a file by ID */
  deleteFile: (fileId: string) =>
    apiFetch(`/files/${fileId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** GET /api/files/user/files — List all files for the current user */
  listUserFiles: () =>
    apiFetch("/files/user/files", {
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Payment Registration  (/api/payment-registration/)
// ─────────────────────────────────────────────

export const paymentApi = {
  /** POST /api/payment-registration/upload-proof — Upload payment proof */
  uploadProof: (file: File, billName: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("billName", billName);
    return apiFetch("/api/payment-registration/upload-proof", {
      method: "POST",
      headers: authHeadersMultipart(),
      body: form,
    });
  },

  /** GET /api/payment-registration/status/:admissionPathId */
  getStatusByPath: (admissionPathId: string) =>
    apiFetch(`/api/payment-registration/status/${admissionPathId}`, {
      headers: authHeaders(),
    }),

  /** GET /api/payment-registration/status?admissionPathId=&billName= */
  getStatus: (params: { admissionPathId?: string; billName?: string }) => {
    const q = new URLSearchParams();
    if (params.admissionPathId) q.set("admissionPathId", params.admissionPathId);
    if (params.billName) q.set("billName", params.billName);
    return apiFetch(`/api/payment-registration/status?${q}`, {
      headers: authHeaders(),
    });
  },
};

// ─────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────

export const coursesApi = {
  /** GET /courses/student/my-courses — Get courses for enrolled student */
  getMyCourses: () =>
    apiFetch("/courses/student/my-courses", {
      headers: authHeaders(),
    }),

  /** POST /courses — Create a new course (Admin/Lecturer) */
  create: (payload: { title: string; description?: string; classId?: number; credits?: number; capacity?: number }) =>
    apiFetch("/courses", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** GET /courses — List all courses (Admin/Lecturer) */
  list: (params?: { classId?: number; search?: string; skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.classId !== undefined) q.set("classId", String(params.classId));
    if (params?.search) q.set("search", params.search);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/courses?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /courses/:id — Get course by ID (with assignments) */
  getById: (id: number | string) =>
    apiFetch(`/courses/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /courses/:id — Update a course (Admin/Lecturer) */
  update: (id: number | string, payload: { title?: string; description?: string }) =>
    apiFetch(`/courses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /courses/:id — Soft-delete a course (Admin/Lecturer) */
  delete: (id: number | string) =>
    apiFetch(`/courses/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Materials
// ─────────────────────────────────────────────

export const heregistrasiApi = {
  /** GET /heregistrasi/my-history — Student re-registration + UKT payment history */
  getMyHistory: () =>
    apiFetch("/heregistrasi/my-history", {
      headers: authHeaders(),
    }),
};

export const materialsApi = {
  /** GET /materials/course/:id — List materials for a course */
  listByCourse: (courseId: number | string, params?: { skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/materials/course/${courseId}?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /materials/:id — Get material by ID */
  getById: (id: number | string) =>
    apiFetch(`/materials/${id}`, {
      headers: authHeaders(),
    }),

  /** POST /materials — Create a new material (Admin/Lecturer) */
  create: (payload: {
    title: string;
    description?: string;
    courseId: number;
    contentType?: string;
    url?: string;
  }) =>
    apiFetch("/materials", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** PUT /materials/:id — Update material (Admin/Lecturer) */
  update: (
    id: number | string,
    payload: { title?: string; description?: string; contentType?: string; url?: string }
  ) =>
    apiFetch(`/materials/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /materials/:id — Soft-delete material (Admin/Lecturer) */
  delete: (id: number | string) =>
    apiFetch(`/materials/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** POST /materials/:id/upload — Upload material file (multipart) */
  uploadFile: (id: number | string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch(`/materials/${id}/upload`, {
      method: "POST",
      headers: authHeadersMultipart(),
      body: form,
    });
  },
};

// ─────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────

export const assignmentsApi = {
  /** POST /assignments — Create a new assignment (Admin/Lecturer) */
  create: (payload: { title: string; description?: string; courseId: number; dueDate?: string }) =>
    apiFetch("/assignments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** GET /assignments/course/:courseId — List assignments for a course */
  listByCourse: (courseId: number | string, params?: { skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/assignments/course/${courseId}?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /assignments/:id — Get assignment by ID */
  getById: (id: number | string) =>
    apiFetch(`/assignments/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /assignments/:id — Update assignment (Admin/Lecturer) */
  update: (
    id: number | string,
    payload: { title?: string; description?: string; dueDate?: string }
  ) =>
    apiFetch(`/assignments/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /assignments/:id — Soft-delete assignment (Admin/Lecturer) */
  delete: (id: number | string) =>
    apiFetch(`/assignments/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** GET /assignments/:id/submissions — List all submissions (Admin/Lecturer) */
  listSubmissions: (id: number | string) =>
    apiFetch(`/assignments/${id}/submissions`, {
      headers: authHeaders(),
    }),

  /** PATCH /assignments/submissions/:submissionId/grade — Grade a submission */
  gradeSubmission: (submissionId: number | string, grade: number, feedback?: string) =>
    apiFetch(`/assignments/submissions/${submissionId}/grade`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ grade, feedback }),
    }),

  /** POST /assignments/:id/submit — Submit an assignment (Student) */
  submit: (id: number | string, content?: string, file?: File) => {
    if (file) {
      const form = new FormData();
      if (content) form.append("content", content);
      form.append("file", file);
      return apiFetch(`/assignments/${id}/submit`, {
        method: "POST",
        headers: authHeadersMultipart(),
        body: form,
      });
    }
    return apiFetch(`/assignments/${id}/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
  },

  /** GET /assignments/:id/my-submission — Get own submission (Student) */
  getMySubmission: (id: number | string) =>
    apiFetch(`/assignments/${id}/my-submission`, {
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Chatbot
// ─────────────────────────────────────────────

export type ChatTopic = "CUSTOMER_SERVICE" | "SCHEDULING" | "COURSE_SUMMARY";

export const chatApi = {
  /** POST /chat/sessions — Create a new chat session */
  createSession: (topic: ChatTopic) =>
    apiFetch("/chat/sessions", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ topic }),
    }),

  /** GET /chat/sessions — Get all sessions for the current user */
  listSessions: () =>
    apiFetch("/chat/sessions", {
      headers: authHeaders(),
    }),

  /** GET /chat/sessions/:sessionId/messages — Get messages in a session */
  getMessages: (sessionId: string) =>
    apiFetch(`/chat/sessions/${sessionId}/messages`, {
      headers: authHeaders(),
    }),

  /** POST /chat/sessions/:sessionId/messages — Send a message */
  sendMessage: (sessionId: string, message: string) =>
    apiFetch(`/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    }),

  /** DELETE /chat/sessions/:sessionId — Delete a chat session */
  deleteSession: (sessionId: string) =>
    apiFetch(`/chat/sessions/${sessionId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Lecturer Self-Management
// ─────────────────────────────────────────────

export const lecturerApi = {
  /** POST /lecturer/assistants/assign — Assign a student as assistant */
  assignAssistant: (studentUserId: string) =>
    apiFetch("/lecturer/assistants/assign", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ studentUserId }),
    }),

  /** DELETE /lecturer/assistants/remove — Remove assistant role */
  removeAssistant: (studentUserId: string) =>
    apiFetch("/lecturer/assistants/remove", {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ studentUserId }),
    }),

  /** GET /lecturer/assistants — List all assistants */
  listAssistants: (params?: { skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/lecturer/assistants?${q}`, {
      headers: authHeaders(),
    });
  },
};

// ─────────────────────────────────────────────
// Admin — User Management
// ─────────────────────────────────────────────

export const adminUsersApi = {
  /** GET /admin/users — List all users */
  list: (params?: {
    role?: string;
    recordStatus?: string;
    search?: string;
    skip?: number;
    take?: number;
    facultyId?: number | string;
    majorId?: number | string;
    classId?: number | string;
  }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.recordStatus) q.set("recordStatus", params.recordStatus);
    if (params?.search) q.set("search", params.search);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    if (params?.facultyId !== undefined) q.set("facultyId", String(params.facultyId));
    if (params?.majorId !== undefined) q.set("majorId", String(params.majorId));
    if (params?.classId !== undefined) q.set("classId", String(params.classId));
    return apiFetch(`/admin/users?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/users/:id — Get user by ID */
  getById: (id: string) =>
    apiFetch(`/admin/users/${id}`, {
      headers: authHeaders(),
    }),

  /** PATCH /admin/users/:id/role — Update user role */
  updateRole: (id: string, role: string) =>
    apiFetch(`/admin/users/${id}/role`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    }),

  /** PATCH /admin/users/:id/status — Update user status */
  updateStatus: (id: string, recordStatus: "active" | "inactive") =>
    apiFetch(`/admin/users/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ recordStatus }),
    }),

  /** POST /admin/users/:id/reset-password — Reset user password (sends email) */
  resetPassword: (id: string) =>
    apiFetch(`/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: authHeaders(),
    }),

  /** DELETE /admin/users/:id — Permanently delete a user */
  delete: (id: string) =>
    apiFetch(`/admin/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admin — Lecturer Management
// ─────────────────────────────────────────────

export const adminLecturersApi = {
  /** POST /admin/lecturers — Create a lecturer account */
  create: (payload: Record<string, unknown>) =>
    apiFetch("/admin/lecturers", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** GET /admin/lecturers — List lecturers */
  list: (params?: {
    faculty?: string;
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.faculty) q.set("faculty", params.faculty);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/admin/lecturers?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/lecturers/:id — Get lecturer by ID */
  getById: (id: string) =>
    apiFetch(`/admin/lecturers/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /admin/lecturers/:id — Update lecturer profile */
  update: (id: string, payload: Record<string, unknown>) =>
    apiFetch(`/admin/lecturers/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** PATCH /admin/lecturers/:id/deactivate — Deactivate a lecturer */
  deactivate: (id: string) =>
    apiFetch(`/admin/lecturers/${id}/deactivate`, {
      method: "PATCH",
      headers: authHeaders(),
    }),

  /** PATCH /admin/lecturers/:id/reactivate — Reactivate a lecturer */
  reactivate: (id: string) =>
    apiFetch(`/admin/lecturers/${id}/reactivate`, {
      method: "PATCH",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admin — Lecture (Class) Management
// ─────────────────────────────────────────────

export const adminLecturesApi = {
  /** POST /admin/lectures — Create a lecture */
  create: (payload: Record<string, unknown>) =>
    apiFetch("/admin/lectures", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** GET /admin/lectures — List lectures */
  list: (params?: {
    search?: string;
    semester?: string;
    recordStatus?: string;
    skip?: number;
    take?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.semester) q.set("semester", params.semester);
    if (params?.recordStatus) q.set("recordStatus", params.recordStatus);
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/admin/lectures?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/lectures/:id — Get lecture by ID */
  getById: (id: string) =>
    apiFetch(`/admin/lectures/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /admin/lectures/:id — Update lecture */
  update: (id: string, payload: Record<string, unknown>) =>
    apiFetch(`/admin/lectures/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /admin/lectures/:id — Soft-delete lecture */
  delete: (id: string) =>
    apiFetch(`/admin/lectures/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** POST /admin/lectures/:id/lecturers — Assign lecturer to lecture */
  assignLecturer: (id: string, lecturerId: string) =>
    apiFetch(`/admin/lectures/${id}/lecturers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ lecturerId }),
    }),

  /** DELETE /admin/lectures/:id/lecturers/:lecturerId — Remove lecturer from lecture */
  removeLecturer: (id: string, lecturerId: string) =>
    apiFetch(`/admin/lectures/${id}/lecturers/${lecturerId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** GET /admin/lectures/:id/lecturers — List lecturers in a lecture */
  listLecturers: (id: string) =>
    apiFetch(`/admin/lectures/${id}/lecturers`, {
      headers: authHeaders(),
    }),

  /** POST /admin/lectures/:id/students — Add student to lecture */
  addStudent: (id: string, studentId: string) =>
    apiFetch(`/admin/lectures/${id}/students`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ studentId }),
    }),

  /** DELETE /admin/lectures/:id/students/:studentId — Remove student from lecture */
  removeStudent: (id: string, studentId: string) =>
    apiFetch(`/admin/lectures/${id}/students/${studentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  /** GET /admin/lectures/:id/students — List students in lecture */
  listStudents: (id: string, params?: { skip?: number; take?: number }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.take !== undefined) q.set("take", String(params.take));
    return apiFetch(`/admin/lectures/${id}/students?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/lectures/:id/attendance — Get attendance records */
  getAttendance: (id: string) =>
    apiFetch(`/admin/lectures/${id}/attendance`, {
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admin — Student Registrations
// ─────────────────────────────────────────────

export const adminRegistrationsApi = {
  /** GET /admin/registrations — List student registrations */
  list: (params?: Record<string, string | number>) => {
    const q = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => q.set(k, String(v)));
    return apiFetch(`/admin/registrations?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/registrations/:id — Get registration by ID */
  getById: (id: string) =>
    apiFetch(`/admin/registrations/${id}`, {
      headers: authHeaders(),
    }),

  /** POST /admin/registrations/validate — Validate registrations with fallback to /result */
  validate: async (registrationIds: string[]) => {
    const res = await apiFetch("/admin/registrations/validate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ registrationIds }),
    });
    if (res.ok || res.status !== 404) return res;

    // Fallback: update via /admin/registration/:id/result
    if (registrationIds.length > 0) {
      const results = await Promise.all(
        registrationIds.map((id) =>
          apiFetch(`/admin/registration/${id}/result`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify({ isAccepted: true }),
          })
        )
      );
      const allOk = results.every((r) => r.ok);
      return {
        ok: allOk,
        status: allOk ? 200 : results[0]?.status || 400,
        data: results[0]?.data,
      };
    }
    return res;
  },

  /** POST /admin/registrations/lock — Lock registrations */
  lock: (ids: string[]) =>
    apiFetch("/admin/registrations/lock", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ids }),
    }),

  /** PUT /admin/registrations/:userId/unlock-registration */
  unlockRegistration: (userId: string) =>
    apiFetch(`/admin/registrations/${userId}/unlock-registration`, {
      method: "PUT",
      headers: authHeaders(),
    }),

  /** PUT /admin/registrations/:userId/unlock-personal-data */
  unlockPersonalData: (userId: string) =>
    apiFetch(`/admin/registrations/${userId}/unlock-personal-data`, {
      method: "PUT",
      headers: authHeaders(),
    }),

  /** PATCH /admin/registration/:id/feedback — Provide feedback */
  setFeedback: (id: string, feedback: string) =>
    apiFetch(`/admin/registration/${id}/feedback`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    }),

  /** PATCH /admin/registration/:id/result — Set acceptance result */
  setResult: (id: string, isAccepted: boolean) =>
    apiFetch(`/admin/registration/${id}/result`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isAccepted }),
    }),
};

export const chatApiAdditions = {
  summarizeMaterial: (materialId: number | string, refresh = false) =>
    apiFetch(
      `/chat/summarize-material/${materialId}${refresh ? "?refresh=true" : ""}`,
      { method: "POST", headers: authHeaders() }
    ),
};
// ─────────────────────────────────────────────
// Admin — Registration Config
// ─────────────────────────────────────────────

export const adminRegistrationConfigApi = {
  /** GET /admin/registration/config — Get full registration config */
  get: () =>
    apiFetch("/admin/registration/config", {
      headers: authHeaders(),
    }),

  /** PATCH /admin/registration/visibility — Bulk update section visibility */
  updateVisibility: (payload: Record<string, boolean>) =>
    apiFetch("/admin/registration/visibility", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** PATCH /admin/registration/fields/required — Bulk update field required status */
  updateRequiredFields: (payload: Record<string, boolean>) =>
    apiFetch("/admin/registration/fields/required", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),
};

// ─────────────────────────────────────────────
// Admin — Personal Data
// ─────────────────────────────────────────────

export const adminPersonalDataApi = {
  /** GET /admin/personaldata/:id — Get student personal data by ID */
  getById: (id: string) =>
    apiFetch(`/admin/personaldata/${id}`, {
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Admin — Payments
// ─────────────────────────────────────────────

export const adminPaymentsApi = {
  /** GET /admin/payments — List all payments */
  list: (params?: { billName?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.billName) q.set("billName", params.billName);
    if (params?.status) q.set("status", params.status);
    return apiFetch(`/admin/payments?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /admin/payments/:paymentId — Get payment by ID */
  getById: (paymentId: string) =>
    apiFetch(`/admin/payments/${paymentId}`, {
      headers: authHeaders(),
    }),

  /** PATCH /admin/payments/:paymentId/confirm — Confirm a payment */
  confirm: (paymentId: string) =>
    apiFetch(`/admin/payments/${paymentId}/confirm`, {
      method: "PATCH",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// Misc
// ─────────────────────────────────────────────

export const miscApi = {
  /** GET /health — Health check */
  health: () => apiFetch("/health"),
};

// ─────────────────────────────────────────────
// Jurusan — Faculty & Major Management
// ─────────────────────────────────────────────

export const jurusanApi = {
  // ── Public (no auth required) ──

  /** GET /jurusan/public/faculties — List all faculties with nested majors (public) */
  getPublicFaculties: () => apiFetch("/jurusan/public/faculties"),

  /** GET /jurusan/public/majors — List all majors, optionally filtered by facultyId (public) */
  getPublicMajors: (facultyId?: number) => {
    const q = new URLSearchParams();
    if (facultyId !== undefined) q.set("facultyId", String(facultyId));
    return apiFetch(`/jurusan/public/majors?${q}`);
  },

  // ── Admin — Faculties ──

  /** GET /jurusan/faculties — Admin: list all faculties with their majors */
  listFaculties: () =>
    apiFetch("/jurusan/faculties", {
      headers: authHeaders(),
    }),

  /** POST /jurusan/faculties — Admin: create a new faculty */
  createFaculty: (name: string) =>
    apiFetch("/jurusan/faculties", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }),

  /** GET /jurusan/faculties/{id} — Admin: get faculty details with majors */
  getFacultyById: (id: number | string) =>
    apiFetch(`/jurusan/faculties/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /jurusan/faculties/{id} — Admin: update faculty name */
  updateFaculty: (id: number | string, name: string) =>
    apiFetch(`/jurusan/faculties/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }),

  /** DELETE /jurusan/faculties/{id} — Admin: delete faculty (only if no majors) */
  deleteFaculty: (id: number | string) =>
    apiFetch(`/jurusan/faculties/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  // ── Admin — Majors ──

  /** GET /jurusan/majors — Admin: list all majors, optionally filtered by facultyId */
  listMajors: (facultyId?: number) => {
    const q = new URLSearchParams();
    if (facultyId !== undefined) q.set("facultyId", String(facultyId));
    return apiFetch(`/jurusan/majors?${q}`, {
      headers: authHeaders(),
    });
  },

  /** POST /jurusan/majors — Admin: create a new major */
  createMajor: (name: string, facultyId: number) =>
    apiFetch("/jurusan/majors", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name, facultyId }),
    }),

  /** GET /jurusan/majors/{id} — Admin: get major details (includes lecturers & classes) */
  getMajorById: (id: number | string) =>
    apiFetch(`/jurusan/majors/${id}`, {
      headers: authHeaders(),
    }),

  /** PUT /jurusan/majors/{id} — Admin: update major name or faculty */
  updateMajor: (id: number | string, payload: { name?: string; facultyId?: number }) =>
    apiFetch(`/jurusan/majors/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** DELETE /jurusan/majors/{id} — Admin: delete major */
  deleteMajor: (id: number | string) =>
    apiFetch(`/jurusan/majors/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

// ─────────────────────────────────────────────
// KRS & Self Enrollment
// ─────────────────────────────────────────────

export const krsApi = {
  /** GET /api/academic-terms/active — Get active academic term */
  getActiveTerm: () =>
    apiFetch("/academic-terms/active", {
      headers: authHeaders(),
    }),

  /** GET /api/courses — List courses for KRS */
  getCourses: (majorId?: number) => {
    const q = new URLSearchParams();
    if (majorId !== undefined) q.set("majorId", String(majorId));
    return apiFetch(`/courses?${q}`, {
      headers: authHeaders(),
    });
  },

  /** GET /api/krs/my-krs — Get current student's KRS */
  getMyKrs: () =>
    apiFetch("/krs/my-krs", {
      headers: authHeaders(),
    }),

  /** POST /api/krs/enroll — Add a single course to the student's KRS */
  enroll: (courseId: number) =>
    apiFetch("/krs/enroll", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ courseId }),
    }),

  // ── Admin: Academic Terms ──

  /** GET /api/academic-terms — Admin: list all terms */
  getAllTerms: () =>
    apiFetch("/academic-terms", {
      headers: authHeaders(),
    }),

  /** POST /api/academic-terms — Admin: create a new term */
  createTerm: (payload: { name: string; startDate: string; endDate: string; isActive?: boolean }) =>
    apiFetch("/academic-terms", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** PUT /api/academic-terms/:id — Admin: update a term */
  updateTerm: (id: number | string, payload: { name?: string; startDate?: string; endDate?: string }) =>
    apiFetch(`/academic-terms/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }),

  /** PATCH /api/academic-terms/:id/activate — Admin: set a term as active */
  activateTerm: (id: number | string) =>
    apiFetch(`/academic-terms/${id}/activate`, {
      method: "PATCH",
      headers: authHeaders(),
    }),

  /** DELETE /api/academic-terms/:id — Admin: delete a term */
  deleteTerm: (id: number | string) =>
    apiFetch(`/academic-terms/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};
