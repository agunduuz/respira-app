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

  it("yanlış e-posta/şifre kombinasyonunu Türkçe anlatır", () => {
    assert.equal(translateAuthError("Invalid login credentials"), "E-posta veya şifre hatalı.");
  });

  it("zaten kayıtlı e-postada Giriş Yap'a yönlendirir", () => {
    assert.match(translateAuthError("User already registered"), /zaten bir hesap var/);
  });

  it("zayıf şifre mesajını Türkçe anlatır", () => {
    assert.match(translateAuthError("Password should be at least 6 characters"), /en az 6 karakter/);
  });

  it("doğrulanmamış e-postayı Türkçe anlatır", () => {
    assert.match(translateAuthError("Email not confirmed"), /doğrulanmamış/);
  });

  it("e-posta sağlayıcısı kapalıyken kayıt kapalı mesajı döner", () => {
    assert.match(translateAuthError("Email signups are disabled"), /kayıt şu anda kapalı/);
  });
});
