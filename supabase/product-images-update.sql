alter table public.products
add column if not exists images text[] default '{}'::text[] not null;

update public.products
set
  images = array[
    'https://cdn.faire.com/fastly/0a4b47c9202f6e86eb7fc4f9ac12be65afbd26a83c5ea8198f5fc3227639fa68.jpeg',
    'https://cdn.faire.com/fastly/837c12049e4bb36794e1ad0c0b5ff97dd79531a1441aaefd9b9ae7c28e3d7313.jpeg'
  ],
  variants = jsonb_build_array(
    jsonb_build_object('id','p1-beige','title','Beige','sku','BABYLY-SLEEPER-BEIGE','price',price,'stock',2,'image','https://cdn.faire.com/fastly/0a4b47c9202f6e86eb7fc4f9ac12be65afbd26a83c5ea8198f5fc3227639fa68.jpeg','status','live'),
    jsonb_build_object('id','p1-pudderrosa','title','Pudderrosa','sku','BABYLY-SLEEPER-PUDDERROSA','price',price,'stock',2,'image','https://cdn.faire.com/fastly/837c12049e4bb36794e1ad0c0b5ff97dd79531a1441aaefd9b9ae7c28e3d7313.jpeg','status','live')
  ),
  updated_at = now()
where legacy_id = 'p1';

update public.products
set
  images = array[
    'https://cdn.faire.com/fastly/81b057e82552add927d1a2040ad353dbb3c89a2244af930cc0dd7a12b7f2137c.jpeg',
    'https://cdn.faire.com/fastly/a3d7ad0eb4bf89e3a8c07f054dfae3a23b800c4e22cdecc691e8e7c4d9b5376b.jpeg',
    'https://cdn.faire.com/fastly/820d1a649bbd4de36c678921bb5b73636a7b1177b0cd04bec78bd0b39f0950a8.jpeg'
  ],
  variants = jsonb_build_array(
    jsonb_build_object('id','p2-beige','title','Beige','sku','BABYLY-NEST-BEIGE','price',price,'stock',1,'image','https://cdn.faire.com/fastly/81b057e82552add927d1a2040ad353dbb3c89a2244af930cc0dd7a12b7f2137c.jpeg','status','live'),
    jsonb_build_object('id','p2-havbla','title','Havblå','sku','BABYLY-NEST-HAVBLA','price',price,'stock',1,'image','https://cdn.faire.com/fastly/a3d7ad0eb4bf89e3a8c07f054dfae3a23b800c4e22cdecc691e8e7c4d9b5376b.jpeg','status','live'),
    jsonb_build_object('id','p2-skovgron','title','Skovgrøn','sku','BABYLY-NEST-SKOVGRON','price',price,'stock',0,'image','https://cdn.faire.com/fastly/820d1a649bbd4de36c678921bb5b73636a7b1177b0cd04bec78bd0b39f0950a8.jpeg','status','live')
  ),
  updated_at = now()
where legacy_id = 'p2';

update public.products
set
  images = array[image_url],
  updated_at = now()
where legacy_id in ('p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16')
  and image_url is not null;
