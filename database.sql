DROP TABLE IF EXISTS users, job, rent_job, comment, subcategory, category, detail_subcategory, skill, auth CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

CREATE TABLE users ( 
	id SERIAL primary key,
	name varchar(255),
	email varchar(255) UNIQUE,
	password varchar(255),
	phone varchar(20),
	birthday date,
	gender varchar(10),
	role "Role" DEFAULT 'USER',
	skill text[],
	certification text[],
	avatar text
);

create table auth (
    id serial primary key,
    refresh_token text,
    user_id int
);

create table job ( 
    id serial primary key,
    job_name varchar(255),
    rate int,
    salary int,
    picture text,
    description text,
    short_description text,
    stars int,
    user_created int,
    detail_subcategory_id int
);

create table rent_job (
    id serial primary key,
    job_id int,
    client_id int,
    date_rent date,
    finish boolean
);

create table comment (
    id serial primary key,
    job_id int,
    commentator_id int,
    date_comment date,
    content varchar(255),
    stars int
);

create table subcategory (
    id serial primary key,
    name varchar(255),
    picture text,
    category_id int,
    UNIQUE(name, category_id)
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    category_name varchar(255) UNIQUE
);

CREATE TABLE detail_subcategory (
    id SERIAL PRIMARY KEY,
    name varchar(255),
    subcategory_id INT,
    UNIQUE(name, subcategory_id)
);

CREATE TABLE skill (
    id SERIAL PRIMARY KEY,
    name varchar(255) UNIQUE
);

ALTER TABLE job
ADD CONSTRAINT fk_job_users
FOREIGN KEY (user_created) REFERENCES users(id) on delete cascade ;

ALTER TABLE comment
ADD CONSTRAINT fk_comment_users
FOREIGN KEY (commentator_id) REFERENCES users(id) on delete cascade;

ALTER TABLE comment
ADD CONSTRAINT fk_comment_job
FOREIGN KEY (job_id) REFERENCES job(id) on delete cascade;

ALTER TABLE rent_job
ADD CONSTRAINT fk_rent_job_job
FOREIGN KEY (job_id) REFERENCES job(id) on delete cascade;

ALTER TABLE rent_job
ADD CONSTRAINT fk_rent_job_users
FOREIGN KEY (client_id) REFERENCES users(id) on delete cascade;

ALTER TABLE subcategory
ADD CONSTRAINT fk_subcategory_category
FOREIGN KEY (category_id) REFERENCES category(id) on delete cascade;

ALTER TABLE detail_subcategory
ADD CONSTRAINT fk_detail_subcategory_subcategory
FOREIGN KEY (subcategory_id) REFERENCES subcategory(id) on delete cascade;

ALTER TABLE job
ADD CONSTRAINT fk_job_detail_subcategory
FOREIGN KEY (detail_subcategory_id) REFERENCES detail_subcategory(id) on delete cascade;

alter table auth
add constraint fk_auth_users
foreign key (user_id) references users(id) on delete cascade;

-- 0. XÓA SẠCH DỮ LIỆU CŨ VÀ RESET ID VỀ 1
TRUNCATE TABLE users, job, rent_job, comment, subcategory, category, detail_subcategory, skill, auth RESTART IDENTITY CASCADE;

-- 1. THÊM NGƯỜI DÙNG 
INSERT INTO users (name, email, password, phone, birthday, gender, role, skill, certification) VALUES 
('Trần Tuấn Anh', 'tuananh.dev@gmail.com', '123456aA', '0901112233', '1995-05-12', 'Nam', 'ADMIN', '{"React", "Node.js", "PostgreSQL"}', '{"AWS Certified Developer"}'),
('Nguyễn Mai Phương', 'maiphuong.client@gmail.com', 'client123', '0912223344', '1990-08-20', 'Nữ', 'USER', NULL, NULL),
('Lê Hải Đăng', 'haidang.design@gmail.com', 'design123', '0983334455', '1998-11-05', 'Nam', 'USER', '{"Photoshop", "Figma", "UI/UX"}', '{"Google UX Design Certificate"}'),
('Phạm Thu Thảo', 'thuthao.client@gmail.com', 'client456', '0934445566', '1992-02-14', 'Nữ', 'USER', NULL, NULL),
('Hoàng Gia Bảo', 'giabao.mkt@gmail.com', 'mkt123', '0975556677', '1996-07-30', 'Nam', 'USER', '{"Facebook Ads", "SEO", "Content"}', '{"Meta Certified Professional"}');

-- 2. THÊM DANH MỤC LỚN (Category)
INSERT INTO category (category_name) VALUES 
('Lập trình & Công nghệ'),
('Thiết kế & Đồ họa'),
('Digital Marketing');

-- 3. THÊM DANH MỤC CHI TIẾT 
INSERT INTO subcategory (name, picture, category_id) VALUES 
('Thiết kế & Lập trình Website', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', 1),
('Lập trình Mobile App', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500', 1),
('Thiết kế Logo & Brand', 'https://images.unsplash.com/photo-1626785773579-c10228bbde34?w=500', 2),
('Thiết kế UI/UX', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500', 2),
('Quản trị & Chăm sóc Fanpage', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500', 3);

-- 4. THÊM BẢNG CHI TIẾT DANH MỤC CON (Detail Subcategory)
INSERT INTO detail_subcategory (name, subcategory_id) VALUES 
('Bán hàng / E-commerce', 1),
('Landing Page', 1),
('Doanh nghiệp / Company Website', 1),
('Tin tức / Blog / Portfolio', 1),
('Bất động sản', 1),
('Học trực tuyến / LMS', 1),
('App Bán hàng & Giao hàng', 2),
('App Quản lý & CRM', 2),
('App Mạng xã hội & Chat', 2),
('App Tài chính / Fintech / Ví điện tử', 2),
('App Đặt lịch / Booking', 2),
('Logo Chuyên nghiệp', 3),
('Bộ nhận diện thương hiệu (Brand Guidelines)', 3),
('Menu / Card Visit / Banner', 3),
('Bao bì & Nhãn mác sản phẩm', 3),
('Profile doanh nghiệp / Catalog', 3),
('UI/UX Mobile App', 4),
('UI/UX Web Application / Dashboard', 4),
('Wireframe & Prototype Interactive', 4),
('Design System / UI Kit', 4),
('Redesign Giao diện cũ', 4),
('Viết bài Content chuẩn SEO / Social', 5),
('Thiết kế Banner / Poster quảng cáo', 5),
('Quản trị Fanpage Facebook / Zalo OA', 5),
('Xây dựng Kênh TikTok / Reels Short Video', 5),
('Seeding & Tăng Tương tác', 5),
('Tối ưu hóa chạy Ads', 5);

-- 5. THÊM CÔNG VIỆC/DỊCH VỤ (Job)
INSERT INTO job (job_name, rate, salary, picture, description, short_description, stars, detail_subcategory_id, user_created) VALUES 
('Làm website bán hàng chuẩn SEO', 150, 15000000, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 'Thiết kế website bán hàng tốc độ cao, tích hợp thanh toán Momo, VNPay, quản trị dễ dàng.', 'Website bán hàng trọn gói', 5, 1, 1),
('Lập trình Landing Page sự kiện', 50, 3000000, 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800', 'Code Landing page siêu mượt bằng ReactJS, hiệu ứng animation đẹp mắt để chạy quảng cáo.', 'Landing page chạy Ads', 4, 2, 1),
('App quản lý kho nội bộ (iOS/Android)', 200, 35000000, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'Làm app quét mã vạch quản lý kho bãi, đồng bộ dữ liệu realtime.', 'App quản lý kho đa tảng', 0, 8, 1),
('Thiết kế Logo công ty Mỹ Phẩm', 80, 2500000, 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800', 'Gói thiết kế logo cao cấp, tặng kèm mockup 3D và file hướng dẫn sử dụng thương hiệu (Brand Guideline).', 'Logo mỹ phẩm sang trọng', 5, 12, 3),
('Thiết kế Logo Quán Cafe', 40, 1000000, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800', 'Thiết kế logo phong cách vintage, hiện đại cho các quán cafe, trà sữa.', 'Logo quán cafe độc đáo', 4, 12, 3),
('Thiết kế UI/UX App Tài chính (Fintech)', 120, 10000000, 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800', 'Lên wireframe và thiết kế UI hoàn chỉnh cho app tài chính, tối ưu trải nghiệm người dùng.', 'UI/UX App Fintech chuyên nghiệp', 5, 17, 3),
('Chăm sóc Fanpage 30 ngày', 60, 4000000, 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800', 'Gói bao gồm: Viết 15 bài content chuẩn, thiết kế 15 hình ảnh, quản lý comment và tin nhắn.', 'Gói chăm sóc Fanpage cơ bản', 5, 24, 5),
('Setup và Tối ưu Quảng cáo Facebook', 90, 3000000, 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800', 'Nghiên cứu tệp khách hàng, setup chiến dịch quảng cáo tối ưu chi phí, cam kết KPI.', 'Chạy Ads Facebook ra đơn', 0, 27, 5);

-- 6. THÊM GIAO DỊCH THUÊ CÔNG VIỆC (Rent Job)
INSERT INTO rent_job (job_id, client_id, date_rent, finish) VALUES 
(1, 2, '2024-01-10', TRUE),
(4, 2, '2024-02-05', TRUE),
(8, 2, '2024-03-01', FALSE),
(2, 4, '2024-01-15', TRUE),
(5, 4, '2024-02-10', TRUE),
(6, 4, '2024-02-20', TRUE),
(7, 4, '2024-03-05', FALSE);

-- 7. THÊM BÌNH LUẬN / ĐÁNH GIÁ (Comment)
INSERT INTO comment (job_id, commentator_id, date_comment, content, stars) VALUES 
(1, 2, '2024-01-25', 'Web code rất nhanh, giao diện chuẩn chỉnh như thiết kế, responsive trên điện thoại tốt.', 5),
(4, 2, '2024-02-12', 'Logo rất ưng ý, bạn designer sửa nhiệt tình dù mình yêu cầu đổi màu mấy lần.', 5),
(2, 4, '2024-01-20', 'Landing page chạy mượt, hiệu ứng đẹp, nhưng phần form đăng ký bị lỗi nhỏ lúc đầu (đã fix).', 4),
(5, 4, '2024-02-15', 'Giá quá rẻ so với chất lượng, logo nhìn rất Tây và hợp phong cách quán mình.', 5),
(6, 4, '2024-03-01', 'UI thiết kế hiện đại, flow mượt mà, tuy nhiên thời gian giao file bị trễ 1 ngày.', 4);

-- 8. THÊM SKILL
INSERT INTO skill (name) VALUES
('JavaScript'), ('Python'), ('Java'), ('C#'), ('C++'), ('SQL'), ('HTML'), ('CSS'), 
('Ruby'), ('PHP'), ('Swift'), ('Kotlin'), ('TypeScript'), ('Go'), ('Rust'), 
('Dart'), ('Scala'), ('Perl'), ('R'), ('MATLAB'), ('Objective-C'), ('Shell Scripting'), 
('PowerShell'), ('Bash'), ('ASP.NET'), ('Node.js'), ('React'), ('Angular'), ('Vue.js'), 
('Django'), ('Flask'), ('Spring Boot'), ('Ruby on Rails'), ('Laravel'), ('Symphony'), 
('Express.js'), ('TensorFlow'), ('PyTorch'), ('Docker'), ('Kubernetes'), ('Git'), 
('Jenkins'), ('CI/CD'), ('Agile'), ('Scrum'), ('TDD'), ('BDD'), ('REST API'), 
('GraphQL'), ('Microservices'), ('Machine Learning'), ('Data Science'), ('Artificial Intelligence'), 
('DevOps'), ('Cloud Computing'), ('AWS'), ('Azure'), ('Google Cloud Platform'), 
('Big Data'), ('Hadoop'), ('Spark'), ('NoSQL'), ('MongoDB'), ('Cassandra'), 
('Redis'), ('Elasticsearch'), ('Firebase');
