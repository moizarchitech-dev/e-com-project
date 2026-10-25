insert into categories (name, slug, description, image_url) values
 ('Kitchen','kitchen','Cookware and serveware that handle daily use','https://picsum.photos/seed/cat-kitchen/900/700'),
 ('Living','living','Textiles and objects for the main room','https://picsum.photos/seed/cat-living/900/700'),
 ('Bedroom','bedroom','Bedding and bedside essentials','https://picsum.photos/seed/cat-bedroom/900/700'),
 ('Outdoor','outdoor','Weatherproof pieces for the patio and beyond','https://picsum.photos/seed/cat-outdoor/900/700');

insert into products (title, slug, description, price, compare_at_price, stock, images, category_id, attributes, is_featured)
select p.title, p.slug, p.description, p.price, p.compare, p.stock,
       array['https://picsum.photos/seed/'||p.slug||'/900/900','https://picsum.photos/seed/'||p.slug||'-b/900/900','https://picsum.photos/seed/'||p.slug||'-c/900/900'],
       c.id, p.attrs::jsonb, p.featured
from (values
 ('Cast Iron Skillet','cast-iron-skillet','Pre-seasoned 10-inch skillet that goes from stovetop to oven to table.',6800,null,25,'kitchen','{"sizes":["8 in","10 in","12 in"]}',true),
 ('Stoneware Dinner Set','stoneware-dinner-set','Sixteen pieces in a reactive glaze. Dishwasher and microwave safe.',12900,15900,12,'kitchen','{"colors":["Slate","Oat","Moss"]}',true),
 ('Walnut Cutting Board','walnut-cutting-board','End-grain board with juice groove, finished with food-safe oil.',5400,null,40,'kitchen','{"sizes":["Small","Large"]}',false),
 ('Enamel Dutch Oven','enamel-dutch-oven','5.5 qt enameled cast iron for braises, bread and stews.',14900,null,0,'kitchen','{"colors":["Pine","Cream"]}',false),
 ('Wool Throw Blanket','wool-throw-blanket','Heavyweight merino blend, woven in a herringbone pattern.',9800,null,30,'living','{"colors":["Charcoal","Fern","Sand"]}',true),
 ('Linen Cushion Cover','linen-cushion-cover','Stonewashed linen with a hidden zip. Insert sold separately.',2800,3400,60,'living','{"sizes":["18 in","22 in"],"colors":["Ink","Natural"]}',false),
 ('Oak Side Table','oak-side-table','Solid oak with a hand-rubbed oil finish and tapered legs.',18900,null,8,'living','{}',true),
 ('Ceramic Table Lamp','ceramic-table-lamp','Hand-glazed base with a linen shade and braided cord.',11200,null,15,'living','{"colors":["White","Green"]}',false),
 ('Organic Cotton Sheet Set','organic-cotton-sheet-set','Percale weave, crisp and cool. Fitted, flat and two pillowcases.',13400,null,22,'bedroom','{"sizes":["Queen","King"],"colors":["White","Fog","Pine"]}',true),
 ('Down Alternative Duvet','down-alternative-duvet','All-season fill in a cotton shell with corner ties.',16800,19800,18,'bedroom','{"sizes":["Queen","King"]}',false),
 ('Teak Lounge Chair','teak-lounge-chair','Weather-resistant teak that silvers gracefully outdoors.',32900,null,5,'outdoor','{}',true),
 ('Galvanized Planter Set','galvanized-planter-set','Set of three planters with drainage holes and rolled rims.',4600,null,35,'outdoor','{"sizes":["Set of 3"]}',false)
) as p(title, slug, description, price, compare, stock, category, attrs, featured)
join categories c on c.slug = p.category;

insert into coupons (code, type, value, min_subtotal) values ('WELCOME10','percent',10,0), ('TAKE20','fixed',2000,10000);
