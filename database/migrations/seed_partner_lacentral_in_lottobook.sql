-- ONE-TIME seed: registers La Central as a partner in Lottobook's DB so
-- the cross-tenant flows can be tested without manual UI clicks.
--
-- Run against lottery-db (Lottobook's database) ONLY.
--
-- The api_key here is La Central's INBOUND CentralKey (configured in its
-- App Service appsettings). Lottobook uses it to authenticate when calling
-- https://api.lacentralnumbers.com/api/public/v1/*.
--
-- Idempotent: re-running updates the row in place.

MERGE INTO dbo.external_tenants AS target
USING (
    SELECT
        'lacentral'                                                                AS tenant_code,
        'La Central'                                                                AS display_name,
        'https://api.lacentralnumbers.com'                                          AS api_base_url,
        'ad77b0654dec5f15705eb09f24e8dfbe589ec7cc2e0e1d2ee773139c6563c69c'         AS api_key,
        CAST(NULL AS NVARCHAR(500))                                                 AS logo_url,
        1                                                                           AS sort_order,
        1                                                                           AS is_active,
        0                                                                           AS can_view_today_sales,
        1                                                                           AS share_results
) AS source
ON target.tenant_code = source.tenant_code
WHEN MATCHED THEN
    UPDATE SET
        display_name         = source.display_name,
        api_base_url         = source.api_base_url,
        api_key              = source.api_key,
        sort_order           = source.sort_order,
        is_active            = source.is_active,
        can_view_today_sales = source.can_view_today_sales,
        share_results        = source.share_results,
        updated_at           = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
    INSERT (tenant_code, display_name, api_base_url, api_key, logo_url, sort_order, is_active, can_view_today_sales, share_results, created_at)
    VALUES (source.tenant_code, source.display_name, source.api_base_url, source.api_key, source.logo_url, source.sort_order, source.is_active, source.can_view_today_sales, source.share_results, SYSUTCDATETIME());
GO

PRINT 'Partner lacentral registered in lottery-db.';
