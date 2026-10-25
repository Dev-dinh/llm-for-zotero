import { assert } from "chai";
import {
  getWebChatConversationId,
  getWebChatTarget,
  getWebChatTargetByModelName,
  getWebChatTargetByUrl,
  getWebChatTargetDisplayName,
  isWebChatUrlForTarget,
} from "../src/webchat/types";

describe("webchat target types", function () {
  it("keeps canonical host model names separate from compact display names", function () {
    assert.equal(
      getWebChatTargetByModelName("chatgpt.com")?.modelName,
      "chatgpt.com",
    );
    assert.equal(
      getWebChatTargetByModelName("chat.deepseek.com")?.modelName,
      "chat.deepseek.com",
    );

    assert.equal(getWebChatTargetDisplayName("chatgpt.com"), "chatgpt");
    assert.equal(getWebChatTargetDisplayName("chat.deepseek.com"), "deepseek");
  });

  it("registers Google Gemini under its canonical host", function () {
    assert.deepInclude(getWebChatTarget("gemini"), {
      id: "gemini",
      label: "Google Gemini",
      modelName: "gemini.google.com",
      displayName: "gemini",
    });
    assert.equal(
      getWebChatTargetByModelName("gemini.google.com")?.id,
      "gemini",
    );
  });

  it("routes only exact HTTPS provider hosts", function () {
    assert.equal(
      getWebChatTargetByUrl(
        "https://gemini.google.com.com/app/1111111111111111",
      )?.id,
      undefined,
    );
    assert.equal(
      getWebChatTargetByUrl(
        "https://gemini.google.com.evil.test/app/1111111111111111",
      )?.id,
      undefined,
    );
    assert.equal(
      getWebChatTargetByUrl("https://evil.test/?next=gemini.google.com")?.id,
      undefined,
    );
    assert.equal(
      getWebChatTargetByUrl("http://gemini.google.com/app/1111111111111111")
        ?.id,
      undefined,
    );
    assert.isFalse(
      isWebChatUrlForTarget(
        "https://www.gemini.google.com/app/1111111111111111",
        "gemini",
      ),
    );
    assert.equal(
      getWebChatTargetByUrl("https://gemini.google.com/app/1111111111111111")
        ?.id,
      "gemini",
    );
  });

  it("extracts conversation ids only from observed provider paths", function () {
    for (const id of [
      "thread-1",
      "A3BA6A650DC4B726",
      "a3ba6a650dc4b72",
      "a3ba6a650dc4b7260",
      "g3ba6a650dc4b726",
      "a3ba6a650dc4b72_",
    ]) {
      assert.isNull(
        getWebChatConversationId(
          `https://gemini.google.com/app/${id}`,
          "gemini",
        ),
        id,
      );
    }
    assert.equal(
      getWebChatConversationId(
        "https://gemini.google.com/app/a3ba6a650dc4b726?hl=en",
        "gemini",
      ),
      "a3ba6a650dc4b726",
    );
    assert.isNull(
      getWebChatConversationId(
        "https://gemini.google.com/chat/a3ba6a650dc4b726",
        "gemini",
      ),
    );
    assert.isNull(
      getWebChatConversationId(
        "https://gemini.google.com/app/a3ba6a650dc4b726/extra",
        "gemini",
      ),
    );
    assert.isNull(
      getWebChatConversationId(
        "https://gemini.google.com.evil.test/app/a3ba6a650dc4b726",
        "gemini",
      ),
    );
  });

  it("registers NotebookLM and validates its conversation routes", function () {
    assert.deepInclude(getWebChatTarget("notebooklm"), {
      id: "notebooklm",
      label: "NotebookLM",
      modelName: "notebooklm.google.com",
      displayName: "notebooklm",
      answerCapture: "dom",
    });
    assert.equal(
      getWebChatTargetByModelName("notebooklm.google.com")?.id,
      "notebooklm",
    );

    const uuid = "a969f72e-7f8a-4b54-b537-8aca8bacf8a0";
    assert.equal(
      getWebChatTargetByUrl(`https://notebooklm.google.com/notebook/${uuid}`)?.id,
      "notebooklm",
    );
    assert.equal(
      getWebChatTargetByUrl(`https://notebook.google.com/notebook/${uuid}`)?.id,
      "notebooklm",
    );
    assert.equal(
      getWebChatTargetByUrl(`https://notebooklm.google.com.evil.test/notebook/${uuid}`)?.id,
      undefined,
    );

    assert.equal(
      getWebChatConversationId(
        `https://notebooklm.google.com/notebook/${uuid}?addSource=true`,
        "notebooklm",
      ),
      uuid,
    );
    assert.equal(
      getWebChatConversationId(
        `https://notebook.google.com/notebook/${uuid}`,
        "notebooklm",
      ),
      uuid,
    );
    assert.isNull(
      getWebChatConversationId(
        "https://notebooklm.google.com/notebook/not-a-valid-uuid",
        "notebooklm",
      ),
    );
  });
});
