--
-- PostgreSQL database dump
--

\restrict FMQMYBhxFSMX89vbxrA8yC0Z5BFcdgWHj7Gt6GJl9AJBwhjSGTUwoYWQrVQfAdL

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-12 22:40:11 EST

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
-- TOC entry 6 (class 2615 OID 18335)
-- Name: control_plane; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA control_plane;


ALTER SCHEMA control_plane OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 18376)
-- Name: admins; Type: TABLE; Schema: control_plane; Owner: postgres
--

CREATE TABLE control_plane.admins (
    id bigint NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text,
    role text DEFAULT 'support'::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admins_role_check CHECK ((role = ANY (ARRAY['super_admin'::text, 'support'::text, 'developer'::text])))
);


ALTER TABLE control_plane.admins OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18375)
-- Name: admins_id_seq; Type: SEQUENCE; Schema: control_plane; Owner: postgres
--

ALTER TABLE control_plane.admins ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME control_plane.admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 18359)
-- Name: domains; Type: TABLE; Schema: control_plane; Owner: postgres
--

CREATE TABLE control_plane.domains (
    hostname text NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE control_plane.domains OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18395)
-- Name: impersonation_audit_log; Type: TABLE; Schema: control_plane; Owner: postgres
--

CREATE TABLE control_plane.impersonation_audit_log (
    id bigint NOT NULL,
    admin_id bigint NOT NULL,
    target_tenant_id uuid NOT NULL,
    reason text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    client_ip text,
    user_agent text
);


ALTER TABLE control_plane.impersonation_audit_log OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18394)
-- Name: impersonation_audit_log_id_seq; Type: SEQUENCE; Schema: control_plane; Owner: postgres
--

ALTER TABLE control_plane.impersonation_audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME control_plane.impersonation_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 18336)
-- Name: tenants; Type: TABLE; Schema: control_plane; Owner: postgres
--

CREATE TABLE control_plane.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    db_name text NOT NULL,
    db_user text NOT NULL,
    db_password_enc text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE control_plane.tenants OWNER TO postgres;

--
-- TOC entry 3320 (class 2606 OID 18393)
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- TOC entry 3322 (class 2606 OID 18391)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 3318 (class 2606 OID 18369)
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (hostname);


--
-- TOC entry 3324 (class 2606 OID 18408)
-- Name: impersonation_audit_log impersonation_audit_log_pkey; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.impersonation_audit_log
    ADD CONSTRAINT impersonation_audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3312 (class 2606 OID 18357)
-- Name: tenants tenants_db_name_key; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.tenants
    ADD CONSTRAINT tenants_db_name_key UNIQUE (db_name);


--
-- TOC entry 3314 (class 2606 OID 18353)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 3316 (class 2606 OID 18355)
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- TOC entry 3325 (class 1259 OID 18419)
-- Name: ix_audit_admin; Type: INDEX; Schema: control_plane; Owner: postgres
--

CREATE INDEX ix_audit_admin ON control_plane.impersonation_audit_log USING btree (admin_id, started_at DESC);


--
-- TOC entry 3326 (class 1259 OID 18420)
-- Name: ix_audit_tenant; Type: INDEX; Schema: control_plane; Owner: postgres
--

CREATE INDEX ix_audit_tenant ON control_plane.impersonation_audit_log USING btree (target_tenant_id, started_at DESC);


--
-- TOC entry 3310 (class 1259 OID 18358)
-- Name: ix_tenants_search; Type: INDEX; Schema: control_plane; Owner: postgres
--

CREATE INDEX ix_tenants_search ON control_plane.tenants USING btree (name text_pattern_ops);


--
-- TOC entry 3327 (class 2606 OID 18370)
-- Name: domains domains_tenant_id_fkey; Type: FK CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.domains
    ADD CONSTRAINT domains_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES control_plane.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 3328 (class 2606 OID 18409)
-- Name: impersonation_audit_log impersonation_audit_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.impersonation_audit_log
    ADD CONSTRAINT impersonation_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES control_plane.admins(id);


--
-- TOC entry 3329 (class 2606 OID 18414)
-- Name: impersonation_audit_log impersonation_audit_log_target_tenant_id_fkey; Type: FK CONSTRAINT; Schema: control_plane; Owner: postgres
--

ALTER TABLE ONLY control_plane.impersonation_audit_log
    ADD CONSTRAINT impersonation_audit_log_target_tenant_id_fkey FOREIGN KEY (target_tenant_id) REFERENCES control_plane.tenants(id);


-- Completed on 2026-01-12 22:40:15 EST

--
-- PostgreSQL database dump complete
--

\unrestrict FMQMYBhxFSMX89vbxrA8yC0Z5BFcdgWHj7Gt6GJl9AJBwhjSGTUwoYWQrVQfAdL

