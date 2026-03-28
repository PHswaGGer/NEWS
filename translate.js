/**
 * 영어 → 한국어 자동 번역 (브라우저에서만 동작, 서버 불필요)
 * MyMemory 무료 API — 하루 사용량·속도 제한이 있어요. 오역이 있을 수 있어요.
 */
(function (global) {
  "use strict";

  var CHUNK = 420;
  var DELAY_MS = 380;
  var CACHE_PREFIX = "mm_tr_ko_v1:";

  function hash(s) {
    var h = 0;
    var i;
    var lim = Math.min(s.length, 8000);
    for (i = 0; i < lim; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function cacheGet(k) {
    try {
      return sessionStorage.getItem(CACHE_PREFIX + k);
    } catch (e) {
      return null;
    }
  }

  function cacheSet(k, v) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + k, v);
    } catch (e) {}
  }

  function splitChunks(text, maxLen) {
    var s = String(text || "").trim();
    if (!s) return [];
    var out = [];
    var i = 0;
    while (i < s.length) {
      var end = Math.min(i + maxLen, s.length);
      if (end < s.length) {
        var sp = s.lastIndexOf(" ", end);
        if (sp > i + 40) end = sp;
      }
      var part = s.slice(i, end).trim();
      if (part) out.push(part);
      i = end;
    }
    return out;
  }

  async function translateChunk(text) {
    var t = String(text || "").trim();
    if (!t) return "";
    var key = hash(t);
    var hit = cacheGet(key);
    if (hit) return hit;
    var url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(t.slice(0, 500)) +
      "&langpair=en|ko";
    var res = await fetch(url);
    if (!res.ok) throw new Error("번역 서버 연결 실패");
    var data = await res.json();
    var out =
      data.responseData && data.responseData.translatedText
        ? String(data.responseData.translatedText)
        : "";
    var st = data.responseStatus;
    if (
      !out ||
      /LIMIT|INVALID|QUERY LENGTH/i.test(out) ||
      (st != null && String(st) !== "200")
    ) {
      var err =
        data.responseData && data.responseData.error
          ? data.responseData.error
          : "번역 실패 (잠시 후 다시 시도)";
      throw new Error(err);
    }
    cacheSet(key, out);
    await sleep(DELAY_MS);
    return out;
  }

  async function translateLong(text) {
    var chunks = splitChunks(text, CHUNK);
    if (!chunks.length) return "";
    var acc = "";
    var j;
    for (j = 0; j < chunks.length; j++) {
      acc += (j ? " " : "") + (await translateChunk(chunks[j]));
    }
    return acc.trim();
  }

  global.MarketsTranslate = {
    translateChunk: translateChunk,
    translateLong: translateLong,
  };
})(window);
