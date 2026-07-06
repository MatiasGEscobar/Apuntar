--
-- PostgreSQL database dump
--

\restrict tZmc87lR7yFwXEM5iTnVPjaYrJ2k1ApW4KdIP0SVsjp8qt2xCvwJBo3QLQskE3r

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: products_category_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.products_category_enum AS ENUM (
    'pistola',
    'revolver',
    'rifle',
    'escopeta',
    'carabina'
);


--
-- Name: products_condition_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.products_condition_enum AS ENUM (
    'nuevo',
    'usado_excelente',
    'usado_bueno',
    'usado_regular'
);


--
-- Name: products_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.products_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'sold',
    'reserved'
);


--
-- Name: transactions_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transactions_status_enum AS ENUM (
    'pending',
    'escrow',
    'completed',
    'cancelled',
    'disputed'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'buyer',
    'seller',
    'admin'
);


--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_status_enum AS ENUM (
    'pending',
    'in_review',
    'approved',
    'rejected',
    'suspended'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "transactionId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    category public.products_category_enum NOT NULL,
    brand character varying NOT NULL,
    model character varying NOT NULL,
    caliber character varying NOT NULL,
    "serialNumber" character varying NOT NULL,
    condition public.products_condition_enum NOT NULL,
    price numeric(12,2) NOT NULL,
    description text NOT NULL,
    images text NOT NULL,
    city character varying NOT NULL,
    province character varying NOT NULL,
    "postalCode" character varying,
    status public.products_status_enum DEFAULT 'pending'::public.products_status_enum NOT NULL,
    "renarRegistrationNumber" character varying,
    "renarCertificateUrl" character varying,
    "sellerId" uuid NOT NULL,
    "rejectionReason" text,
    "moderatedBy" character varying,
    "moderatedAt" timestamp without time zone,
    views integer DEFAULT 0 NOT NULL,
    favorites integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    "buyerId" uuid NOT NULL,
    "sellerId" uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    "buyerCommission" numeric(12,2) NOT NULL,
    "sellerCommission" numeric(12,2) NOT NULL,
    "totalCommission" numeric(12,2) NOT NULL,
    status public.transactions_status_enum DEFAULT 'pending'::public.transactions_status_enum NOT NULL,
    "mercadoPagoPaymentId" character varying,
    "mercadoPagoPreferenceId" character varying,
    "escrowReleaseDate" timestamp without time zone,
    "buyerNotes" text,
    "sellerNotes" text,
    "buyerRating" integer,
    "sellerRating" integer,
    "buyerReview" text,
    "sellerReview" text,
    "completedAt" timestamp without time zone,
    "cancelledAt" timestamp without time zone,
    "cancellationReason" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    role public.users_role_enum DEFAULT 'buyer'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'pending'::public.users_status_enum NOT NULL,
    dni character varying NOT NULL,
    clu character varying NOT NULL,
    "cluExpirationDate" date,
    cuil character varying,
    phone character varying,
    address character varying,
    city character varying,
    province character varying,
    "postalCode" character varying,
    "dniFrontUrl" character varying,
    "dniBackUrl" character varying,
    "cluFrontUrl" character varying,
    "cluBackUrl" character varying,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" character varying,
    rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    "totalSales" integer DEFAULT 0 NOT NULL,
    "totalPurchases" integer DEFAULT 0 NOT NULL,
    "rejectionReason" text,
    "verifiedBy" character varying,
    "verifiedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, "transactionId", "senderId", content, "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, category, brand, model, caliber, "serialNumber", condition, price, description, images, city, province, "postalCode", status, "renarRegistrationNumber", "renarCertificateUrl", "sellerId", "rejectionReason", "moderatedBy", "moderatedAt", views, favorites, "createdAt", "updatedAt") FROM stdin;
a5742b75-94ef-425d-950e-e3d517e16d04	Bersa thunder 380	pistola	Bersa	Thunder 380	.380 ACP	BT48.03-40256	nuevo	950000.00	sin detalles, nueva, con una sola prueba de 5 disparos en polígono al comprar.	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1781920034/armalegal/products/jvpjwlik0yjsweuk5mpm.jpg	Resistencia	Chaco	3550	reserved	\N	\N	fea4e332-7f5d-4eaf-88c5-262137d32b13	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-19 23:08:12.013	33	0	2026-06-20 01:47:39.652368	2026-06-24 01:33:07.994011
c22ce7d1-ddf4-46ba-a00b-6b30c298422b	bersa prueba 2	pistola	bersa	thunder 2	9mm	aa2566636aa	nuevo	500000.00	muy bueno sin .......................................................................................	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1782243353/armalegal/products/rsfjnjkrwyagcrdfetpx.jpg	formosa	Formosa	3434	reserved	\N	\N	fea4e332-7f5d-4eaf-88c5-262137d32b13	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-23 16:36:08.627	15	0	2026-06-23 19:35:58.140485	2026-06-29 02:29:16.489573
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, "productId", "buyerId", "sellerId", amount, "buyerCommission", "sellerCommission", "totalCommission", status, "mercadoPagoPaymentId", "mercadoPagoPreferenceId", "escrowReleaseDate", "buyerNotes", "sellerNotes", "buyerRating", "sellerRating", "buyerReview", "sellerReview", "completedAt", "cancelledAt", "cancellationReason", "createdAt", "updatedAt") FROM stdin;
49263b66-8484-4038-bd9f-4cb0dcd488bf	a5742b75-94ef-425d-950e-e3d517e16d04	8e6ce6e7-de78-4869-992f-3e8f09e24226	fea4e332-7f5d-4eaf-88c5-262137d32b13	950000.00	14250.00	14250.00	28500.00	cancelled	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-20 00:32:47.699	Cancelado por el comprador	2026-06-20 02:09:02.947162	2026-06-20 03:32:47.743768
b6b8d451-67bc-46d6-a7f5-f70781910a59	c22ce7d1-ddf4-46ba-a00b-6b30c298422b	dae5f80f-af10-4650-9a2d-0328c876d5d1	fea4e332-7f5d-4eaf-88c5-262137d32b13	500000.00	7500.00	7500.00	15000.00	cancelled	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-23 16:45:30.176	Cancelado por el comprador	2026-06-23 19:36:21.546652	2026-06-23 19:45:30.216753
3c7e77f3-65a2-4fba-8262-bf55d11a17b1	a5742b75-94ef-425d-950e-e3d517e16d04	dae5f80f-af10-4650-9a2d-0328c876d5d1	fea4e332-7f5d-4eaf-88c5-262137d32b13	950000.00	14250.00	14250.00	28500.00	cancelled	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-23 16:45:34.147	Cancelado por el comprador	2026-06-20 03:36:35.07686	2026-06-23 19:45:34.199556
5f9cd30f-205b-4dee-9f7e-5e623bedeef7	a5742b75-94ef-425d-950e-e3d517e16d04	dae5f80f-af10-4650-9a2d-0328c876d5d1	fea4e332-7f5d-4eaf-88c5-262137d32b13	950000.00	14250.00	14250.00	28500.00	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-24 01:33:07.999755	2026-06-24 01:33:07.999755
6673b043-4605-4de7-8785-430965ebd013	c22ce7d1-ddf4-46ba-a00b-6b30c298422b	ce99cca3-62f9-4d65-824d-271bf074d3b2	fea4e332-7f5d-4eaf-88c5-262137d32b13	500000.00	7500.00	7500.00	15000.00	pending	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-29 02:29:16.494126	2026-06-29 02:29:16.494126
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, "firstName", "lastName", role, status, dni, clu, "cluExpirationDate", cuil, phone, address, city, province, "postalCode", "dniFrontUrl", "dniBackUrl", "cluFrontUrl", "cluBackUrl", "twoFactorEnabled", "twoFactorSecret", rating, "totalSales", "totalPurchases", "rejectionReason", "verifiedBy", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
a3a82e00-fd17-46bc-9386-dbfeed806212	prueba1@mail.com	$2b$10$7EK17BJilG.mcyOSUEook.STGenThyOmV.MVVM.b4Q5PyTdjU5zf6	Prueba	Uno	seller	pending	25469853	CLU258963	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	f	\N	0.00	0	0	\N	\N	\N	2026-06-12 04:03:50.967457	2026-06-12 04:03:50.967457
8e6ce6e7-de78-4869-992f-3e8f09e24226	admin@armalegal.ar	$2b$10$affv2tSW2vdUrNgZfh/PzO4KgKOboo93.zIhEQa6.uNxSpX3nBQyO	Admin	Sistema	admin	approved	99999999	ADMIN999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	0.00	0	0	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-19 22:40:05.802	2026-06-20 01:39:19.2727	2026-06-20 01:40:05.816137
fea4e332-7f5d-4eaf-88c5-262137d32b13	matiie9135@gmail.com	$2b$10$U6.ZAz.nz6A6U4BeI5r6BOv1swT2J5oTc1bfQ/OhxieBCdUE0c76G	matias	escobar	seller	approved	35466176	clu458796	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	f	\N	0.00	0	0	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-19 22:41:12.773	2026-06-18 03:34:49.65149	2026-06-20 01:41:12.777744
dae5f80f-af10-4650-9a2d-0328c876d5d1	juan@example.com	$2b$10$7nx/F9iFyjMwopEv2UUTquLjZbzHoz7fiHZL0JRI8gmzLMLjo3JiW	Compra	Dor1	buyer	approved	15469875	ABB5846965	\N	\N		\N	\N	\N	\N	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1781926430/armalegal/documents/dtfvpndwdnpwaro14pky.jpg	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1781926500/armalegal/documents/bb8ayg0u09fni2accw0g.jpg	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1781926441/armalegal/documents/fzudotzrvvfkhzfls9rs.jpg	https://res.cloudinary.com/dqvfxj0xx/image/upload/v1781926515/armalegal/documents/a8kvckn0vf400pneec3i.jpg	f	\N	0.00	0	0	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-20 00:35:51.229	2026-06-20 01:43:10.947896	2026-06-20 03:35:51.232285
ce99cca3-62f9-4d65-824d-271bf074d3b2	test_user_589599485882107335@testuser.com	$2b$10$NVixsYgFos2N.Zev556T1ePQqks8CBisaXxxnOYdkMa3MRFSg4zhu	pruebaMP	mercpag	buyer	approved	58959554	testuser123	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	f	\N	0.00	0	0	\N	8e6ce6e7-de78-4869-992f-3e8f09e24226	2026-06-28 23:29:00.767	2026-06-29 02:28:02.843163	2026-06-29 02:29:00.771991
\.


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: users UQ_035abcb1f444689ac3066c4ee06; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_035abcb1f444689ac3066c4ee06" UNIQUE (clu);


--
-- Name: products UQ_583e2e03516b21627b56dc7f87d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "UQ_583e2e03516b21627b56dc7f87d" UNIQUE ("serialNumber");


--
-- Name: users UQ_5fe9cfa518b76c96518a206b350; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE (dni);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: messages FK_2db9cf2b3ca111742793f6c37ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES public.users(id);


--
-- Name: messages FK_3c6715302efcd7baba71fc8c038; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_3c6715302efcd7baba71fc8c038" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id);


--
-- Name: transactions FK_5642b5bed5c9404a1424df580f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_5642b5bed5c9404a1424df580f1" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: transactions FK_5848e57fcb8971eeb768c3a6b44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_5848e57fcb8971eeb768c3a6b44" FOREIGN KEY ("sellerId") REFERENCES public.users(id);


--
-- Name: products FK_e40a1dd2909378f0da1f34f7bd6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES public.users(id);


--
-- Name: transactions FK_ec4767e5beacbc7dfaa507d1fc6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_ec4767e5beacbc7dfaa507d1fc6" FOREIGN KEY ("buyerId") REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict tZmc87lR7yFwXEM5iTnVPjaYrJ2k1ApW4KdIP0SVsjp8qt2xCvwJBo3QLQskE3r

