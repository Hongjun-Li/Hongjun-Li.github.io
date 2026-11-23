
import test from "node:test";
import assert from "node:assert/strict";
import { loadConfigs, validateConfigs } from "./config-validation.js";
import { parseConfig } from "../src/utils/parseConfig.js";

test("current website configuration is valid", () => {
  assert.deepEqual(validateConfigs(loadConfigs()), []);
});

test("JSONC supports comments", () => {
  const source = '{ // comment\n "value": 1 }';
  const result = parseConfig(source, "theme.jsonc", true);
  assert.equal(result.value, 1);
});

test("missing required fields are rejected", () => {
  const config = loadConfigs();
  delete config["hero.json"].primaryLinks;

  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /hero.json.*primaryLinks/);
});

test("duplicate publication IDs are rejected", () => {
  const config = loadConfigs();

  config["publications.json"][1].id =
    config["publications.json"][0].id;

  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /duplicate ID/);
});

test("unknown publication preview IDs are rejected", () => {
  const config = loadConfigs();

  config["publication-previews.json"] = {
    "nonexistent-paper": {
      template: "basic",
      abstractExpanded: true
    }
  };

  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /nonexistent-paper/);
});

test("publications without custom previews are valid", () => {
  const config = loadConfigs();

  config["publication-previews.json"] = {};
  assert.deepEqual(validateConfigs(config), []);
});

test("missing image assets are rejected", () => {
  const config = loadConfigs();

  config["hero.json"].profileImage =
    "assets/nonexistent-profile-image.jpg";

  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /asset not found/);
});

test("unknown configuration keys are rejected", () => {
  const config = loadConfigs();

  config["education.json"].enable = true;

  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /additionalProperty.*enable/);
});
