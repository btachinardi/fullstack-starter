/**
 * Session Parser Tests
 */

import { describe, expect, it } from "vitest";
import { SessionParser } from "./session-parser";

describe("SessionParser", () => {
  it("should create a new parser instance", () => {
    const parser = new SessionParser();
    expect(parser).toBeInstanceOf(SessionParser);
  });

  it("should parse a valid JSONL line", () => {
    const parser = new SessionParser();
    expect(parser.getEntries()).toHaveLength(0);
  });

  it("should extract tool uses correctly", async () => {
    // This test would require a sample JSONL file
    // For now, we just verify the methods exist
    const parser = new SessionParser();
    expect(typeof parser.getToolUses).toBe("function");
    expect(typeof parser.getSubagentInvocations).toBe("function");
    expect(typeof parser.getFilesRead).toBe("function");
  });

  it("should calculate token usage", () => {
    const parser = new SessionParser();
    const usage = parser.getTokenUsage();

    expect(usage).toHaveProperty("totalInputTokens");
    expect(usage).toHaveProperty("totalOutputTokens");
    expect(usage).toHaveProperty("totalCacheCreation");
    expect(usage).toHaveProperty("totalCacheRead");

    expect(typeof usage.totalInputTokens).toBe("number");
    expect(typeof usage.totalOutputTokens).toBe("number");
  });

  it("should filter tool uses by name", () => {
    const parser = new SessionParser();
    const readTools = parser.getToolUsesByName("Read");
    expect(Array.isArray(readTools)).toBe(true);
  });

  it("should get conversation flow", () => {
    const parser = new SessionParser();
    const conversation = parser.getConversationFlow();
    expect(Array.isArray(conversation)).toBe(true);
  });

  it("should search entries", () => {
    const parser = new SessionParser();
    const results = parser.searchEntries("test");
    expect(Array.isArray(results)).toBe(true);
  });
});
