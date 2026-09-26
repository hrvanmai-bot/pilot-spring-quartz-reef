# WOTU AI Quote Engine

MVP module for natural-language interior quotation.

## Route
- /ai-quote

## Current flow
1. Enter customer + natural-language request.
2. Parser converts common furniture/kitchen requests into structured quote items.
3. Pricing engine calculates amounts from a controlled price table.
4. Chat can modify the active quote and creates a new version.
5. Previous versions can be restored.
6. Browser print can save the quote as PDF.

## Important
This MVP intentionally keeps AI/pricing deterministic. Production should connect:
- LLM API for intent/entity extraction and chat edits.
- Supabase for products, price tables, customers, quotes, versions and templates.
- Excel template engine for exact WOTU quotation forms.
- Server-side pricing calculations and permissions.

## Example commands
- "Đổi bếp này thành 4m"
- "Đổi sang MDF chống ẩm"
- "Thêm 2 ray âm Blum"
- "Giảm giá 5%"
- "Bỏ kính"
