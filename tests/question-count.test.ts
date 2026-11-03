import test from "node:test";
import assert from "node:assert/strict";
import { generateQuizResponse } from "../server/generateQuiz.js";
import sample from "../src/data/questions.json" with { type: "json" };
import { validateQuestions } from "../src/services/questions.ts";

test("offline sample supports fifty distinct valid questions", () => {
  assert.ok(validateQuestions(sample));
  assert.equal(sample.length, 50);
  assert.equal(new Set(sample.map(question => question.q)).size, 50);
});

test("invalid counts are rejected before contacting Gemini", async () => {
  for (const count of [0, 51, 1.5, "12", null]) {
    const response = await generateQuizResponse({ notesText: "Test", count }, {});
    assert.equal(response.status, 400);
  }
});

test("request and response must match the chosen count", async t => {
  for (const count of [1, 12, 50]) {
    await t.test(String(count), async t => {
      t.mock.method(globalThis, "fetch", async (_url, request) => {
        const body = JSON.parse(request.body);
        assert.equal(body.generationConfig.responseSchema.maxItems, count);
        return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(sample.slice(0,count))}]}}]});
      });
      const response = await generateQuizResponse({notesText:"Test", count}, {AI_API_KEY:"fixture"});
      assert.equal(response.status, 200);
      assert.equal((await response.json()).length, count);
    });
  }
});

test("a partial deck cannot replace the requested deck", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({candidates:[{content:{parts:[{text:JSON.stringify(sample.slice(0,1))}]}}]}));
  const response = await generateQuizResponse({notesText:"Test", count:2}, {AI_API_KEY:"fixture"});
  assert.equal(response.status, 422);
});
