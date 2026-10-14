import { describe, expect, it } from "vitest";
import { hosting, missingHostingFields, missingOperatorFields, operator, operatorComplete } from "../legal";

describe("legal details", () => {
  it("never ships invented operator details: unset fields are reported as missing", () => {
    for (const f of missingOperatorFields()) expect((operator as Record<string, string>)[f].trim()).toBe("");
    expect(operatorComplete()).toBe(missingOperatorFields().length === 0);
  });

  it("requires name, address and email for the Impressum", () => {
    const required = ["name", "street", "postalCode", "city", "country", "email"];
    const empty = { name: "", street: "", postalCode: "", city: "", country: "", email: "" };
    expect(Object.keys(empty).sort()).toEqual([...required].sort());
    expect(Object.keys(operator)).toEqual(expect.arrayContaining(required));
  });

  it("tracks the hosting details the privacy policy needs", () => {
    expect(Object.keys(hosting).sort()).toEqual(["location", "logRetention", "provider"]);
    for (const f of missingHostingFields()) expect((hosting as Record<string, string>)[f].trim()).toBe("");
  });
});
