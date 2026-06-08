import { getApiError, ApiClientError } from "@/src/services/client";

describe("getApiError", () => {
  it("returns detail from ApiClientError", () => {
    const err = new ApiClientError(404, "Not found");
    expect(getApiError(err)).toBe("Not found");
  });

  it("returns message from generic Error", () => {
    const err = new Error("Generic error");
    expect(getApiError(err)).toBe("Generic error");
  });

  it("returns fallback for unknown error", () => {
    expect(getApiError("unknown")).toBe("Erro desconhecido.");
  });
});
