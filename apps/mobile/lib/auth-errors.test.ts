import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { translateAuthError } from "./auth-errors.ts";

describe("translateAuthError", () => {
  it("süresi dolmuş/geçersiz kodu Türkçe ve eyleme dönük anlatır", () => {
    assert.match(translateAuthError("Token has expired or is invalid"), /süresi dolmuş|geçersiz/);
  });

  it("hız sınırı mesajındaki saniyeyi Türkçeye taşır", () => {
    const msg = translateAuthError("For security purposes, you can only request this after 42 seconds.");
    assert.match(msg, /42 saniye/);
  });

  it("boş/undefined mesajda genel bir Türkçe mesaj döner", () => {
    assert.equal(translateAuthError(undefined), "Bir şeyler ters gitti. Lütfen tekrar dene.");
  });

  it("bilinmeyen bir mesajda genel Türkçe mesaja düşer", () => {
    assert.equal(translateAuthError("some unmapped supabase error"), "Bir şeyler ters gitti. Lütfen tekrar dene.");
  });
});
