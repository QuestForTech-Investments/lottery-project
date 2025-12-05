SELECT draw_id, draw_name, image_url
FROM draws
WHERE image_url IS NOT NULL
ORDER BY draw_name;
