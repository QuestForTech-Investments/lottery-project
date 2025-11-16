USE [lottery-db];
GO

SELECT country_id, country_name, country_code
FROM countries
ORDER BY country_name;
