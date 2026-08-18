import { describe, expect, it } from "vitest";
import { AUTOMATION_CATALOG } from "@openhands/extensions/automations";
import { INTEGRATION_CATALOG } from "@openhands/extensions/integrations";
import {
  getAutomationLaunchPrompt,
  getAutomationsForIntegration,
} from "#/utils/automation-catalog";

const automationById = (id: string) =>
  AUTOMATION_CATALOG.find((automation) => automation.id === id)!;

describe("getAutomationLaunchPrompt", () => {
  it("resolves the command from the skill that implements the automation", () => {
    // Arrange / Act / Assert — an entry whose skill is its own id, and one
    // that names a different skill, both resolve to that skill's command.
    expect(
      getAutomationLaunchPrompt(automationById("github-pr-reviewer")),
    ).toBe("/pr-reviewer:setup");
    expect(
      getAutomationLaunchPrompt(
        automationById("incident-retrospective-drafter"),
      ),
    ).toBe("/incident-retro:setup");
  });

  it("spells the request out when the skill declares no command", () => {
    // Arrange / Act / Assert — `jira-issue-to-pr` is invoked by description,
    // so there is no trigger to resolve.
    expect(getAutomationLaunchPrompt(automationById("jira-issue-to-pr"))).toBe(
      "Set up the Jira issue to GitHub PR automation",
    );
  });
});

describe("getAutomationsForIntegration", () => {
  it("matches the exact declared integration id instead of provider keywords", () => {
    // Arrange: GitHub appears in copy across the catalog, while only entries
    // that declare `github` should be eligible after a GitHub connection.
    const expectedIds = AUTOMATION_CATALOG.filter((automation) =>
      Object.hasOwn(automation.requires.integrations, "github"),
    ).map((automation) => automation.id);

    // Act
    const matches = getAutomationsForIntegration(AUTOMATION_CATALOG, "github");

    // Assert
    expect(matches.map((automation) => automation.id)).toEqual(expectedIds);
    expect(matches).not.toContain(automationById("slack-standup-digest"));
  });

  it("returns an empty list when the connected integration has no recommendations", () => {
    expect(
      INTEGRATION_CATALOG.some((integration) => integration.id === "atlassian"),
    ).toBe(true);
    expect(
      getAutomationsForIntegration(AUTOMATION_CATALOG, "atlassian"),
    ).toEqual([]);
  });
});
