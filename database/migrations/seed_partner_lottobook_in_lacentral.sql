-- ONE-TIME seed: registers Lottobook as a partner in La Central's DB so
-- La Central's "Grupo" dropdown lists Lottobook and the result sync works
-- bidirectionally.
--
-- Run against lottery-db-lacentral ONLY.
--
-- The api_key here is Lottobook's INBOUND CentralKey (configured in
-- lottery-api-prod App Service appsettings).
--
-- Idempotent: re-running updates the row in place.

MERGE INTO dbo.external_tenants AS target
USING (
    SELECT
        'lottobook'                                                                AS tenant_code,
        'Lottobook'                                                                 AS display_name,
        'https://lottery-api-prod.azurewebsites.net'                                AS api_base_url,
        'e07f685afdb79d5cf0a8f17ea2f9f7eaf2d7ae19993b737c4f195945d2a4a2b8'         AS api_key,
        CAST(NULL AS NVARCHAR(500))                                                 AS logo_url,
        1                                                                           AS sort_order,
        1                                                                           AS is_active,
        1                                                                           AS can_view_today_sales,
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

PRINT 'Partner lottobook registered in lottery-db-lacentral.';
