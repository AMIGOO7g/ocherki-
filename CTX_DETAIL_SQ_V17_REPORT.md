# CTX Detail SQ v1.7 — implementation report

> Актуальный системный отчёт: `ONE_BOOK_SYSTEM_V18_REPORT.md`. Он дополняет этот паспорт правилами semantic ROI, историей фотографий, отсутствием пустого CTX, общей геометрией ПК/мобильного и DARK FADE 2.2.

## Implemented

- The existing `OcherkiLayoutPagination` remains the only layout pagination engine.
- The post-opening rhythm is fixed: measured text on the left, `D01-CTX-DETAIL-SQ` on the right.
- CTX uses one source URL twice: the dominant view and a literal CSS crop of the same pixels.
- V, S and H have separate reference geometry; the detail card has no shadow or generated layer.
- An inline quote now occupies one selected column. Source text continues below it in that same column.
- Quote placement alternates left/right for browser coverage.
- Paragraph separator boundaries no longer evict the preceding complete line.
- Short text remains in the first column and is not stretched into two columns.
- Margin handwriting stays graphite grey and inside the safe page zone.

## Test Mode

Use **Приёмка CTX v1.7**. It builds three chapters with V, S and H examples and includes:

1. chapter opening;
2. mandatory text-left / CTX-right spread;
3. quote in the left column with text below;
4. quote in the right column with text below;
5. a short final text remainder with CTX still present.

`qa/ctx-v17-browser-check.html` runs the DOM contract automatically and exposes its result as `window.__CTX_V17_QA`.

## Verification

- All JavaScript regression suites pass.
- JavaScript syntax checks pass.
- Source serialization remains exact, including Unicode and original whitespace.
- Browser QA is built into Test Mode and the dedicated QA page.
