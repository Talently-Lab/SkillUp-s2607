const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

/** Shape of every error the API sends: `{ error: { code, message, details? } }` */
type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string[]>;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, string[]> | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type AuthHandlers = {
  getAccessToken: () => string | null;
  /** Renews the session and returns the new access token, or null if it's gone */
  refreshAccessToken: () => Promise<string | null>;
};

let authHandlers: AuthHandlers = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
};

/** Set by the auth store, so the client doesn't depend on it */
export function configureAuth(handlers: AuthHandlers) {
  authHandlers = handlers;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Sends the access token and retries once with a new one if it expired */
  auth?: boolean;
};

async function send(
  path: string,
  { method = "GET", body }: RequestOptions,
  accessToken: string | null,
) {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // The refresh token travels in an httpOnly cookie
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not connect with the server");
  }
}

async function toApiError(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

  return new ApiError(
    response.status,
    body?.error?.code ?? "UNKNOWN_ERROR",
    body?.error?.message ?? response.statusText,
    body?.error?.details,
  );
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = options.auth ? authHandlers.getAccessToken() : null;
  let response = await send(path, options, token);

  if (options.auth && response.status === 401) {
    const error = await toApiError(response);
    if (error.code !== "TOKEN_EXPIRED") throw error;

    const newToken = await authHandlers.refreshAccessToken();
    if (!newToken) throw error;
    response = await send(path, options, newToken);
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** Shape of every paginated list of the API */
export type Page<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** The API returns at most 50 items per page, so long lists are read page by page */
const PAGE_SIZE = 50;

export async function requestAllPages<T>(
  path: string,
  options: Pick<RequestOptions, "auth"> = {},
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const { data, pagination } = await request<Page<T>>(
      `${path}?page=${page}&limit=${PAGE_SIZE}`,
      options,
    );
    items.push(...data);
    if (page >= pagination.totalPages) return items;
  }
}
