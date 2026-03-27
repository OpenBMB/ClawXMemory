import type { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalUiServer } from "../src/ui-server.js";

const activeServers: LocalUiServer[] = [];

async function startUiServer(): Promise<string> {
  const uiServer = new LocalUiServer(
    {} as never,
    {} as never,
    { host: "127.0.0.1", port: 0, prefix: "/clawxmemory" },
    {} as never,
    {},
  );
  activeServers.push(uiServer);

  const rawServer = (uiServer as unknown as { server: Server }).server;
  const listening = new Promise<void>((resolve) => {
    rawServer.once("listening", () => resolve());
  });

  uiServer.start();
  await listening;

  const address = rawServer.address();
  if (!address || typeof address === "string") {
    throw new Error("UI server did not expose a TCP port");
  }

  return `http://127.0.0.1:${address.port}/clawxmemory`;
}

afterEach(async () => {
  while (activeServers.length > 0) {
    const uiServer = activeServers.pop();
    if (!uiServer) continue;

    const rawServer = (uiServer as unknown as { server: Server }).server;
    const closed = rawServer.listening
      ? new Promise<void>((resolve) => {
          rawServer.once("close", () => resolve());
        })
      : Promise.resolve();

    uiServer.stop();
    await closed;
  }
});

describe("LocalUiServer static assets", () => {
  it("serves dashboard html with favicon and logo branding", async () => {
    const baseUrl = await startUiServer();

    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain('rel="icon"');
    expect(html).toContain("./assets/brand/logo.png");
    expect(html).not.toContain(">CX<");
    expect(html).not.toContain(">Memory<");
  });

  it("serves the brand logo as png", async () => {
    const baseUrl = await startUiServer();

    const response = await fetch(`${baseUrl}/assets/brand/logo.png`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");

    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it("warns with uiPort config instructions when the dashboard port is already in use", async () => {
    const baseUrl = await startUiServer();
    const occupiedPort = Number(new URL(baseUrl).port);
    const warn = vi.fn();

    const conflictingServer = new LocalUiServer(
      {} as never,
      {} as never,
      { host: "127.0.0.1", port: occupiedPort, prefix: "/clawxmemory" },
      {} as never,
      { warn },
    );
    activeServers.push(conflictingServer);

    conflictingServer.start();

    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(`port ${occupiedPort} is already in use`));
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("plugins.entries.clawxmemory-openclaw.config.uiPort"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("~/.openclaw/openclaw.json"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("OPENCLAW_CONFIG_PATH"));
  });
});
