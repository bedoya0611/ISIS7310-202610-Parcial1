type ErrorPayload = {
  message?: string;
  error?: string;
  detail?: string;
};

function getPayloadMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const typedPayload = payload as ErrorPayload;
  return typedPayload.message ?? typedPayload.error ?? typedPayload.detail ?? "";
}

export async function getApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  let serverMessage = "";
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    serverMessage = getPayloadMessage(payload);
  } else {
    serverMessage = (await response.text().catch(() => "")).trim();
  }

  const finalMessage = serverMessage || fallbackMessage;
  return `Error ${response.status}: ${finalMessage}`;
}
