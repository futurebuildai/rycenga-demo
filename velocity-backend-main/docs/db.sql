--
-- PostgreSQL database dump
--

\restrict zwAwqae4qDh4YLYgqytd829ic3INmwVRDdubUGSG1e11zGjchVKGMHL5RaWSjdG

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-14 12:24:28 EST

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
-- TOC entry 7 (class 2615 OID 16483)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- TOC entry 6 (class 2615 OID 16389)
-- Name: core; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA core;


ALTER SCHEMA core OWNER TO postgres;

--
-- TOC entry 8 (class 2615 OID 17687)
-- Name: integrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA integrations;


ALTER SCHEMA integrations OWNER TO postgres;

--
-- TOC entry 1051 (class 1247 OID 17793)
-- Name: system_role_enum; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.system_role_enum AS ENUM (
    'platform',
    'owner',
    'staff',
    'support',
    'none'
);


ALTER TYPE auth.system_role_enum OWNER TO postgres;

--
-- TOC entry 1027 (class 1247 OID 17649)
-- Name: user_role_enum; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.user_role_enum AS ENUM (
    'tenant_owner',
    'tenant_staff',
    'account_admin',
    'account_manager',
    'account_user'
);


ALTER TYPE auth.user_role_enum OWNER TO postgres;

--
-- TOC entry 1003 (class 1247 OID 17238)
-- Name: account_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.account_type_enum AS ENUM (
    'business',
    'individual'
);


ALTER TYPE core.account_type_enum OWNER TO postgres;

--
-- TOC entry 970 (class 1247 OID 16968)
-- Name: address_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.address_type_enum AS ENUM (
    'billing',
    'shipping',
    'job_site',
    'remit_to'
);


ALTER TYPE core.address_type_enum OWNER TO postgres;

--
-- TOC entry 1012 (class 1247 OID 17290)
-- Name: audit_event_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.audit_event_type_enum AS ENUM (
    'login',
    'logout',
    'config_change',
    'user_create',
    'user_update',
    'order_status_change',
    'impersonation_start'
);


ALTER TYPE core.audit_event_type_enum OWNER TO postgres;

--
-- TOC entry 1024 (class 1247 OID 17596)
-- Name: config_scope_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.config_scope_enum AS ENUM (
    'platform',
    'tenant'
);


ALTER TYPE core.config_scope_enum OWNER TO postgres;

--
-- TOC entry 973 (class 1247 OID 16978)
-- Name: document_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.document_type_enum AS ENUM (
    'invoice',
    'credit_memo',
    'statement',
    'proof_of_delivery',
    'quote',
    'order_ack',
    'pick_ticket'
);


ALTER TYPE core.document_type_enum OWNER TO postgres;

--
-- TOC entry 961 (class 1247 OID 16918)
-- Name: invoice_status_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.invoice_status_enum AS ENUM (
    'draft',
    'open',
    'paid',
    'partially_paid',
    'past_due',
    'void',
    'credit_memo'
);


ALTER TYPE core.invoice_status_enum OWNER TO postgres;

--
-- TOC entry 964 (class 1247 OID 16934)
-- Name: order_status_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.order_status_enum AS ENUM (
    'draft',
    'open',
    'pending_fulfillment',
    'partially_shipped',
    'shipped',
    'ready_for_pickup',
    'cancelled',
    'completed'
);


ALTER TYPE core.order_status_enum OWNER TO postgres;

--
-- TOC entry 997 (class 1247 OID 17211)
-- Name: payment_method_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.payment_method_type_enum AS ENUM (
    'card',
    'ach'
);


ALTER TYPE core.payment_method_type_enum OWNER TO postgres;

--
-- TOC entry 958 (class 1247 OID 16806)
-- Name: payment_status_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.payment_status_enum AS ENUM (
    'initiated',
    'authorized',
    'captured',
    'voided',
    'refunded',
    'failed',
    'cancelled',
    'processing'
);


ALTER TYPE core.payment_status_enum OWNER TO postgres;

--
-- TOC entry 967 (class 1247 OID 16952)
-- Name: quote_status_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.quote_status_enum AS ENUM (
    'draft',
    'sent',
    'viewed',
    'accepted',
    'rejected',
    'expired',
    'converted'
);


ALTER TYPE core.quote_status_enum OWNER TO postgres;

--
-- TOC entry 1009 (class 1247 OID 17276)
-- Name: setting_category_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.setting_category_enum AS ENUM (
    'general',
    'branding',
    'finance',
    'integration',
    'notifications',
    'security'
);


ALTER TYPE core.setting_category_enum OWNER TO postgres;

--
-- TOC entry 1006 (class 1247 OID 17262)
-- Name: setting_data_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.setting_data_type_enum AS ENUM (
    'string',
    'integer',
    'boolean',
    'json',
    'secret',
    'url'
);


ALTER TYPE core.setting_data_type_enum OWNER TO postgres;

--
-- TOC entry 991 (class 1247 OID 17158)
-- Name: shipment_status_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.shipment_status_enum AS ENUM (
    'scheduled',
    'picking',
    'loaded',
    'out_for_delivery',
    'delivered',
    'attempted_failed'
);


ALTER TYPE core.shipment_status_enum OWNER TO postgres;

--
-- TOC entry 1015 (class 1247 OID 17394)
-- Name: staff_assignment_type_enum; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.staff_assignment_type_enum AS ENUM (
    'primary_sales_rep',
    'inside_sales_rep',
    'credit_manager'
);


ALTER TYPE core.staff_assignment_type_enum OWNER TO postgres;

--
-- TOC entry 1033 (class 1247 OID 17689)
-- Name: provider_type_enum; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.provider_type_enum AS ENUM (
    'erp',
    'tax',
    'payment',
    'communication',
    'analytics'
);


ALTER TYPE integrations.provider_type_enum OWNER TO postgres;

--
-- TOC entry 1036 (class 1247 OID 17700)
-- Name: sync_direction_enum; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.sync_direction_enum AS ENUM (
    'inbound',
    'outbound'
);


ALTER TYPE integrations.sync_direction_enum OWNER TO postgres;

--
-- TOC entry 1039 (class 1247 OID 17706)
-- Name: sync_trigger_enum; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.sync_trigger_enum AS ENUM (
    'scheduled',
    'manual',
    'webhook',
    'system'
);


ALTER TYPE integrations.sync_trigger_enum OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 17820)
-- Name: trigger_audit_log(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.trigger_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_user_id bigint;
    current_account_id bigint;
    current_impersonator_id bigint;
BEGIN
    -- Attempt to read variables set by the API Middleware
    -- (You will set these in your API before executing SQL)
    BEGIN
        current_user_id := current_setting('app.current_user_id')::bigint;
        current_account_id := current_setting('app.current_account_id')::bigint;
        current_impersonator_id := current_setting('app.current_impersonator_id', true)::bigint; -- true = allow null
    EXCEPTION WHEN OTHERS THEN
        -- Fallback for direct SQL access (Console/Admin usage)
        current_user_id := NULL;
    END;

    INSERT INTO core.audit_logs (
        event_type,
        user_id,
        account_id,
        resource_id,
        old_value,
        new_value,
        is_impersonation,
        impersonator_user_id
    )
    VALUES (
        TG_OP::core.audit_event_type_enum, -- 'INSERT' -> mapped to event enum (needs casting/mapping logic)
        current_user_id,
        current_account_id,
        NEW.id::text,
        row_to_json(OLD)::text,
        row_to_json(NEW)::text,
        (current_impersonator_id IS NOT NULL),
        current_impersonator_id
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION core.trigger_audit_log() OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 17790)
-- Name: update_registry_status(); Type: FUNCTION; Schema: integrations; Owner: postgres
--

CREATE FUNCTION integrations.update_registry_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'completed_with_errors') THEN
        UPDATE integrations.registry
        SET 
            last_batch_id = NEW.id,
            last_run_status = NEW.status,
            last_success_at = CASE WHEN NEW.status = 'completed' THEN NEW.completed_at ELSE last_success_at END,
            last_failure_at = CASE WHEN NEW.status = 'failed' THEN NEW.completed_at ELSE last_failure_at END,
            updated_at = NOW()
        WHERE id = NEW.integration_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION integrations.update_registry_status() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 16791)
-- Name: api_keys; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.api_keys (
    id bigint NOT NULL,
    key_hash character varying(255) CONSTRAINT api_keys_key_not_null NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    revoked boolean DEFAULT false,
    user_id bigint NOT NULL,
    name text
);


ALTER TABLE auth.api_keys OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 18456)
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.api_keys ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.api_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 16548)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    refresh_token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    active_account_id bigint,
    impersonator_user_id bigint
);


ALTER TABLE auth.sessions OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16547)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.sessions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16499)
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id bigint NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    password_hash text NOT NULL,
    name text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id bigint,
    role auth.user_role_enum DEFAULT 'account_manager'::auth.user_role_enum NOT NULL
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: postgres
--

COMMENT ON TABLE auth.users IS 'Users within this tenant. All users implicitly belong to the organization that owns this database.';


--
-- TOC entry 226 (class 1259 OID 16498)
-- Name: users_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16405)
-- Name: account_addresses; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.account_addresses (
    address_id bigint CONSTRAINT customer_addresses_address_id_not_null NOT NULL,
    account_id bigint CONSTRAINT customer_addresses_customer_id_not_null NOT NULL,
    line_1 text CONSTRAINT customer_addresses_address_line_1_not_null NOT NULL,
    line_2 text,
    line_3 text,
    city text CONSTRAINT customer_addresses_city_not_null NOT NULL,
    state text CONSTRAINT customer_addresses_state_not_null NOT NULL,
    zip text CONSTRAINT customer_addresses_zip_not_null NOT NULL,
    country text,
    is_default boolean DEFAULT false CONSTRAINT customer_addresses_is_default_not_null NOT NULL,
    postal_code text,
    address_type core.address_type_enum DEFAULT 'billing'::core.address_type_enum NOT NULL,
    external_id text
);


ALTER TABLE core.account_addresses OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 17459)
-- Name: account_assignments; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.account_assignments (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    user_id bigint NOT NULL,
    assignment_type core.staff_assignment_type_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.account_assignments OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17458)
-- Name: account_assignments_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.account_assignments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.account_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 286 (class 1259 OID 18552)
-- Name: account_summaries; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.account_summaries (
    account_id bigint NOT NULL,
    aging_current numeric(12,2) DEFAULT 0,
    aging_30 numeric(12,2) DEFAULT 0,
    aging_60 numeric(12,2) DEFAULT 0,
    aging_90 numeric(12,2) DEFAULT 0,
    aging_90_plus numeric(12,2) DEFAULT 0,
    total_balance numeric(12,2) DEFAULT 0,
    past_due_balance numeric(12,2) DEFAULT 0,
    last_sync_at timestamp with time zone DEFAULT now(),
    credit_limit numeric(12,2)
);


ALTER TABLE core.account_summaries OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16391)
-- Name: accounts; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.accounts (
    id bigint CONSTRAINT customers_id_not_null NOT NULL,
    number text,
    external_id text,
    name text,
    email text,
    phone text,
    active boolean CONSTRAINT customers_active_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT customers_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT customers_updated_at_not_null NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar CONSTRAINT customers_currency_code_not_null NOT NULL,
    payment_terms_code text,
    tax_id text,
    timezone text DEFAULT 'America/Chicago'::text CONSTRAINT customers_timezone_not_null NOT NULL,
    last_synced_at timestamp with time zone,
    type core.account_type_enum DEFAULT 'business'::core.account_type_enum NOT NULL,
    parent_account_id bigint,
    default_price_level_id bigint,
    home_location_id bigint
);


ALTER TABLE core.accounts OWNER TO postgres;

--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE accounts; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.accounts IS 'Customer accounts within this tenant. These are the end-customers of the B2B client (tenant).';


--
-- TOC entry 287 (class 1259 OID 18765)
-- Name: account_financials; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.account_financials AS
 SELECT a.id AS account_id,
    a.number AS account_number,
    a.name AS account_name,
    a.currency_code,
    s.credit_limit,
    COALESCE(s.aging_current, (0)::numeric) AS total_balance,
    COALESCE(s.aging_30, (0)::numeric) AS aging_30,
    COALESCE(s.aging_60, (0)::numeric) AS aging_60,
    COALESCE(s.aging_90, (0)::numeric) AS aging_90,
    COALESCE(s.aging_90_plus, (0)::numeric) AS aging_90_plus,
    (s.credit_limit - COALESCE(s.aging_current, (0)::numeric)) AS available_credit,
    s.last_sync_at
   FROM (core.accounts a
     LEFT JOIN core.account_summaries s ON ((a.id = s.account_id)));


ALTER VIEW core.account_financials OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16390)
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.accounts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 262 (class 1259 OID 17551)
-- Name: audit_logs; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    event_type core.audit_event_type_enum NOT NULL,
    resource_id text,
    old_value text,
    new_value text,
    is_impersonation boolean DEFAULT false,
    impersonator_user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id bigint,
    CONSTRAINT chk_audit_impersonation CHECK (((is_impersonation = false) OR ((is_impersonation = true) AND (impersonator_user_id IS NOT NULL))))
);


ALTER TABLE core.audit_logs OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17550)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 263 (class 1259 OID 17628)
-- Name: configuration; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.configuration (
    key text CONSTRAINT tenant_settings_key_not_null NOT NULL,
    value text CONSTRAINT tenant_settings_value_not_null NOT NULL,
    scope core.config_scope_enum DEFAULT 'tenant'::core.config_scope_enum CONSTRAINT tenant_settings_scope_not_null NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by bigint
);


ALTER TABLE core.configuration OWNER TO postgres;

--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE configuration; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.configuration IS 'Global configuration for this environment. 
Rows with scope="platform" are system-level overrides (managed by SaaS). 
Rows with scope="tenant" are editable by the business owner.';


--
-- TOC entry 281 (class 1259 OID 18265)
-- Name: contract_prices; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.contract_prices (
    id bigint NOT NULL,
    account_id bigint,
    job_id bigint,
    product_id bigint NOT NULL,
    uom text NOT NULL,
    fixed_price numeric(12,4) NOT NULL,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.contract_prices OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 18264)
-- Name: contract_prices_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.contract_prices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.contract_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16404)
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.account_addresses ALTER COLUMN address_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.customer_addresses_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16641)
-- Name: invoices; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.invoices (
    id bigint NOT NULL,
    account_id bigint CONSTRAINT invoices_customer_id_not_null NOT NULL,
    invoice_number text NOT NULL,
    external_id text,
    invoice_date date NOT NULL,
    due_date date,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_total numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0 NOT NULL,
    balance_due numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status core.invoice_status_enum DEFAULT 'open'::core.invoice_status_enum NOT NULL,
    type core.document_type_enum DEFAULT 'invoice'::core.document_type_enum NOT NULL,
    last_synced_at timestamp with time zone,
    job_id bigint,
    location_id bigint
);


ALTER TABLE core.invoices OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16571)
-- Name: orders; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.orders (
    id bigint NOT NULL,
    account_id bigint CONSTRAINT orders_customer_id_not_null NOT NULL,
    order_number text NOT NULL,
    external_id text,
    order_date date NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_total numeric(12,2) DEFAULT 0 NOT NULL,
    shipping_total numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status core.order_status_enum DEFAULT 'open'::core.order_status_enum NOT NULL,
    last_synced_at timestamp with time zone,
    job_id bigint,
    location_id bigint
);


ALTER TABLE core.orders OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16607)
-- Name: quotes; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.quotes (
    id bigint NOT NULL,
    account_id bigint CONSTRAINT quotes_customer_id_not_null NOT NULL,
    quote_number text NOT NULL,
    external_id text,
    quote_date date NOT NULL,
    expires_on date,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_total numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status core.quote_status_enum DEFAULT 'draft'::core.quote_status_enum NOT NULL,
    last_synced_at timestamp with time zone,
    job_id bigint,
    location_id bigint
);


ALTER TABLE core.quotes OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 18316)
-- Name: dashboard_overview; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.dashboard_overview AS
 SELECT a.id AS account_id,
    a.name AS account_name,
    s.credit_limit,
    COALESCE(s.aging_current, (0)::numeric) AS current_balance,
    COALESCE(balances.past_due_count, (0)::bigint) AS past_due_invoices_count,
    COALESCE(orders_count.active_val, (0)::bigint) AS active_orders_count,
    COALESCE(quotes_count.pending_val, (0)::bigint) AS pending_quotes_count,
    COALESCE(recent_inv.data, '[]'::json) AS recent_invoices,
    COALESCE(recent_ord.data, '[]'::json) AS recent_orders,
    COALESCE(recent_qte.data, '[]'::json) AS recent_quotes
   FROM (((((((core.accounts a
     LEFT JOIN core.account_summaries s ON ((a.id = s.account_id)))
     LEFT JOIN LATERAL ( SELECT sum(i.balance_due) AS current_balance,
            count(*) FILTER (WHERE (i.status = 'past_due'::core.invoice_status_enum)) AS past_due_count
           FROM core.invoices i
          WHERE ((i.account_id = a.id) AND (i.status = ANY (ARRAY['open'::core.invoice_status_enum, 'past_due'::core.invoice_status_enum, 'partially_paid'::core.invoice_status_enum])))) balances ON (true))
     LEFT JOIN LATERAL ( SELECT count(*) AS active_val
           FROM core.orders o
          WHERE ((o.account_id = a.id) AND (o.status <> ALL (ARRAY['completed'::core.order_status_enum, 'cancelled'::core.order_status_enum, 'draft'::core.order_status_enum])))) orders_count ON (true))
     LEFT JOIN LATERAL ( SELECT count(*) AS pending_val
           FROM core.quotes q
          WHERE ((q.account_id = a.id) AND (q.status = ANY (ARRAY['sent'::core.quote_status_enum, 'viewed'::core.quote_status_enum])))) quotes_count ON (true))
     LEFT JOIN LATERAL ( SELECT json_agg(t.*) AS data
           FROM ( SELECT invoices.id,
                    invoices.invoice_number,
                    invoices.total,
                    invoices.balance_due,
                    invoices.due_date,
                    invoices.status
                   FROM core.invoices
                  WHERE (invoices.account_id = a.id)
                  ORDER BY invoices.created_at DESC
                 LIMIT 3) t) recent_inv ON (true))
     LEFT JOIN LATERAL ( SELECT json_agg(t.*) AS data
           FROM ( SELECT orders.id,
                    orders.order_number,
                    orders.total,
                    orders.status,
                    orders.order_date
                   FROM core.orders
                  WHERE (orders.account_id = a.id)
                  ORDER BY orders.created_at DESC
                 LIMIT 3) t) recent_ord ON (true))
     LEFT JOIN LATERAL ( SELECT json_agg(t.*) AS data
           FROM ( SELECT quotes.id,
                    quotes.quote_number,
                    quotes.total,
                    quotes.status,
                    quotes.expires_on
                   FROM core.quotes
                  WHERE (quotes.account_id = a.id)
                  ORDER BY quotes.created_at DESC
                 LIMIT 3) t) recent_qte ON (true));


ALTER VIEW core.dashboard_overview OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16767)
-- Name: documents; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.documents (
    id bigint NOT NULL,
    account_id bigint,
    filename text,
    mime_type text,
    storage_key text NOT NULL,
    hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    doc_type core.document_type_enum NOT NULL
);


ALTER TABLE core.documents OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16766)
-- Name: documents_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.documents ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 275 (class 1259 OID 18191)
-- Name: inventory; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.inventory (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    location_id bigint NOT NULL,
    qty_on_hand numeric(12,4) DEFAULT 0 NOT NULL,
    qty_committed numeric(12,4) DEFAULT 0 NOT NULL,
    qty_available numeric(12,4) GENERATED ALWAYS AS ((qty_on_hand - qty_committed)) STORED,
    last_synced_at timestamp with time zone DEFAULT now()
);


ALTER TABLE core.inventory OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 18190)
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.inventory ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 250 (class 1259 OID 17081)
-- Name: invoice_lines; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.invoice_lines (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    line_number integer NOT NULL,
    item_code text NOT NULL,
    description text,
    quantity_billed numeric(12,4) DEFAULT 0 NOT NULL,
    uom text NOT NULL,
    unit_price numeric(12,4) DEFAULT 0 NOT NULL,
    extended_price numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    conversion_factor numeric(12,6) DEFAULT 1.0
);


ALTER TABLE core.invoice_lines OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 17080)
-- Name: invoice_lines_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.invoice_lines ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.invoice_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16640)
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.invoices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 17005)
-- Name: jobs; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.jobs (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    job_number text NOT NULL,
    name text NOT NULL,
    po_number text,
    address_line_1 text,
    address_line_2 text,
    city text,
    state text,
    zip text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_synced_at timestamp with time zone,
    site_contact_name text,
    site_contact_phone text,
    site_contact_email text
);


ALTER TABLE core.jobs OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17004)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.jobs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 273 (class 1259 OID 18176)
-- Name: locations; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.locations (
    id bigint NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address_line_1 text,
    city text,
    state text,
    zip text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.locations OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 18175)
-- Name: locations_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.locations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 248 (class 1259 OID 17049)
-- Name: order_lines; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.order_lines (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    line_number integer NOT NULL,
    item_code text NOT NULL,
    description text,
    quantity_ordered numeric(12,4) DEFAULT 0 NOT NULL,
    quantity_shipped numeric(12,4) DEFAULT 0 NOT NULL,
    quantity_backordered numeric(12,4) DEFAULT 0 NOT NULL,
    uom text NOT NULL,
    unit_price numeric(12,4) DEFAULT 0 NOT NULL,
    extended_price numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    conversion_factor numeric(12,6) DEFAULT 1.0
);


ALTER TABLE core.order_lines OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17048)
-- Name: order_lines_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.order_lines ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.order_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16570)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 16743)
-- Name: payment_allocations; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.payment_allocations (
    id bigint NOT NULL,
    payment_id bigint NOT NULL,
    invoice_id bigint,
    amount_applied numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_allocations_amount_applied_check CHECK ((amount_applied > (0)::numeric))
);


ALTER TABLE core.payment_allocations OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16742)
-- Name: payment_allocations_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.payment_allocations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.payment_allocations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 258 (class 1259 OID 17216)
-- Name: payment_methods; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.payment_methods (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    type core.payment_method_type_enum NOT NULL,
    provider_token text NOT NULL,
    brand text,
    last4 text,
    exp_month integer,
    exp_year integer,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.payment_methods OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17215)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.payment_methods ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 16709)
-- Name: payment_transactions; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.payment_transactions (
    id bigint NOT NULL,
    account_id bigint CONSTRAINT payment_transactions_customer_id_not_null NOT NULL,
    user_id bigint,
    external_id text,
    provider text NOT NULL,
    status core.payment_status_enum DEFAULT 'initiated'::core.payment_status_enum NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    amount numeric(12,2) NOT NULL,
    convenience_fee numeric(12,2) DEFAULT 0 NOT NULL,
    total_charged numeric(12,2) DEFAULT 0 NOT NULL,
    payment_method_type text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    settled_at timestamp with time zone,
    failure_code text,
    failure_message text
);


ALTER TABLE core.payment_transactions OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16708)
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.payment_transactions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.payment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 277 (class 1259 OID 18219)
-- Name: price_levels; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.price_levels (
    id bigint NOT NULL,
    name text NOT NULL,
    erp_id text,
    rank integer DEFAULT 0
);


ALTER TABLE core.price_levels OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 18218)
-- Name: price_levels_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.price_levels ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.price_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 285 (class 1259 OID 18504)
-- Name: product_categories; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.product_categories (
    id bigint NOT NULL,
    name text NOT NULL,
    parent_id bigint,
    external_id text,
    slug text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.product_categories OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 18503)
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.product_categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.product_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 279 (class 1259 OID 18235)
-- Name: product_prices; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.product_prices (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    price_level_id bigint NOT NULL,
    uom text NOT NULL,
    price numeric(12,4) NOT NULL,
    min_quantity numeric(12,4) DEFAULT 1 NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL
);


ALTER TABLE core.product_prices OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 18234)
-- Name: product_prices_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.product_prices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.product_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 254 (class 1259 OID 17141)
-- Name: products; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.products (
    id bigint NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    base_uom text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    external_id text,
    last_synced_at timestamp with time zone,
    category_id bigint
);


ALTER TABLE core.products OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17140)
-- Name: products_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 252 (class 1259 OID 17112)
-- Name: quote_lines; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.quote_lines (
    id bigint NOT NULL,
    quote_id bigint NOT NULL,
    line_number integer NOT NULL,
    item_code text NOT NULL,
    description text,
    quantity numeric(12,4) DEFAULT 0 NOT NULL,
    uom text NOT NULL,
    unit_price numeric(12,4) DEFAULT 0 NOT NULL,
    extended_price numeric(12,2) DEFAULT 0 NOT NULL,
    section_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.quote_lines OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 17111)
-- Name: quote_lines_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.quote_lines ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.quote_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16606)
-- Name: quotes_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.quotes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.quotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 256 (class 1259 OID 17172)
-- Name: shipments; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.shipments (
    id bigint NOT NULL,
    account_id bigint NOT NULL,
    order_id bigint,
    job_id bigint,
    shipment_number text NOT NULL,
    status core.shipment_status_enum DEFAULT 'scheduled'::core.shipment_status_enum NOT NULL,
    scheduled_date date,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    vehicle_number text,
    driver_name text,
    tracking_url text,
    pod_document_id bigint,
    signature_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.shipments OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17171)
-- Name: shipments_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.shipments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.shipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 16680)
-- Name: statements; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.statements (
    id bigint NOT NULL,
    account_id bigint CONSTRAINT statements_customer_id_not_null NOT NULL,
    statement_number text,
    period_start date NOT NULL,
    period_end date NOT NULL,
    statement_date date NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    opening_balance numeric(12,2) DEFAULT 0 NOT NULL,
    closing_balance numeric(12,2) DEFAULT 0 NOT NULL,
    document_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.statements OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16679)
-- Name: statements_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.statements ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.statements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 265 (class 1259 OID 17660)
-- Name: uom_conversions; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.uom_conversions (
    id bigint NOT NULL,
    from_uom text NOT NULL,
    to_uom text NOT NULL,
    factor numeric(12,6) NOT NULL,
    product_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.uom_conversions OWNER TO postgres;

--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE uom_conversions; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.uom_conversions IS 'Defines math for converting units. If product_id is null, it is a global rule (e.g., 12 IN = 1 FT). If set, it is specific (e.g., 1 Box = 50 Screws).';


--
-- TOC entry 264 (class 1259 OID 17659)
-- Name: uom_conversions_id_seq; Type: SEQUENCE; Schema: core; Owner: postgres
--

ALTER TABLE core.uom_conversions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME core.uom_conversions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 269 (class 1259 OID 17736)
-- Name: batches; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.batches (
    id bigint NOT NULL,
    integration_id bigint NOT NULL,
    entity_type text NOT NULL,
    direction integrations.sync_direction_enum NOT NULL,
    trigger_source integrations.sync_trigger_enum DEFAULT 'scheduled'::integrations.sync_trigger_enum NOT NULL,
    triggered_by_user_id bigint,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    duration_ms integer,
    records_processed integer DEFAULT 0,
    records_added integer DEFAULT 0,
    records_updated integer DEFAULT 0,
    records_failed integer DEFAULT 0,
    correlation_id text,
    batch_file_url text
);


ALTER TABLE integrations.batches OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17735)
-- Name: batches_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

ALTER TABLE integrations.batches ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME integrations.batches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 271 (class 1259 OID 17770)
-- Name: logs; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.logs (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    level text DEFAULT 'error'::text NOT NULL,
    external_id text,
    error_code text,
    message text,
    payload_snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE integrations.logs OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 17769)
-- Name: logs_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

ALTER TABLE integrations.logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME integrations.logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 267 (class 1259 OID 17716)
-- Name: registry; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.registry (
    id bigint NOT NULL,
    name text NOT NULL,
    provider_key text NOT NULL,
    type integrations.provider_type_enum NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    last_batch_id bigint,
    last_run_status text,
    last_success_at timestamp with time zone,
    last_failure_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE integrations.registry OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17715)
-- Name: registry_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

ALTER TABLE integrations.registry ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME integrations.registry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3689 (class 2606 OID 16804)
-- Name: api_keys api_keys_key_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.api_keys
    ADD CONSTRAINT api_keys_key_key UNIQUE (key_hash);


--
-- TOC entry 3691 (class 2606 OID 18447)
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- TOC entry 3652 (class 2606 OID 16560)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3654 (class 2606 OID 16562)
-- Name: sessions sessions_refresh_token_hash_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_refresh_token_hash_key UNIQUE (refresh_token_hash);


--
-- TOC entry 3646 (class 2606 OID 16516)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3641 (class 2606 OID 16417)
-- Name: account_addresses account_addresses_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_addresses
    ADD CONSTRAINT account_addresses_pkey PRIMARY KEY (address_id);


--
-- TOC entry 3728 (class 2606 OID 17472)
-- Name: account_assignments account_assignments_account_id_user_id_assignment_type_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_assignments
    ADD CONSTRAINT account_assignments_account_id_user_id_assignment_type_key UNIQUE (account_id, user_id, assignment_type);


--
-- TOC entry 3730 (class 2606 OID 17470)
-- Name: account_assignments account_assignments_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_assignments
    ADD CONSTRAINT account_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 3777 (class 2606 OID 18567)
-- Name: account_summaries account_summaries_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_summaries
    ADD CONSTRAINT account_summaries_pkey PRIMARY KEY (account_id);


--
-- TOC entry 3632 (class 2606 OID 16403)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 17562)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 17639)
-- Name: configuration configuration_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.configuration
    ADD CONSTRAINT configuration_pkey PRIMARY KEY (key);


--
-- TOC entry 3769 (class 2606 OID 18277)
-- Name: contract_prices contract_prices_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.contract_prices
    ADD CONSTRAINT contract_prices_pkey PRIMARY KEY (id);


--
-- TOC entry 3687 (class 2606 OID 16778)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3757 (class 2606 OID 18204)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3703 (class 2606 OID 17102)
-- Name: invoice_lines invoice_lines_invoice_line_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoice_lines
    ADD CONSTRAINT invoice_lines_invoice_line_key UNIQUE (invoice_id, line_number);


--
-- TOC entry 3705 (class 2606 OID 17100)
-- Name: invoice_lines invoice_lines_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoice_lines
    ADD CONSTRAINT invoice_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3668 (class 2606 OID 16671)
-- Name: invoices invoices_account_id_invoice_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoices
    ADD CONSTRAINT invoices_account_id_invoice_number_key UNIQUE (account_id, invoice_number);


--
-- TOC entry 3670 (class 2606 OID 16669)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 17023)
-- Name: jobs jobs_account_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.jobs
    ADD CONSTRAINT jobs_account_number_key UNIQUE (account_id, job_number);


--
-- TOC entry 3696 (class 2606 OID 17021)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 3753 (class 2606 OID 18189)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 3699 (class 2606 OID 17074)
-- Name: order_lines order_lines_order_line_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_lines
    ADD CONSTRAINT order_lines_order_line_key UNIQUE (order_id, line_number);


--
-- TOC entry 3701 (class 2606 OID 17072)
-- Name: order_lines order_lines_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_lines
    ADD CONSTRAINT order_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 16599)
-- Name: orders orders_account_id_order_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_account_id_order_number_key UNIQUE (account_id, order_number);


--
-- TOC entry 3660 (class 2606 OID 16597)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3685 (class 2606 OID 16753)
-- Name: payment_allocations payment_allocations_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_allocations
    ADD CONSTRAINT payment_allocations_pkey PRIMARY KEY (id);


--
-- TOC entry 3725 (class 2606 OID 17230)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3681 (class 2606 OID 16729)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 18228)
-- Name: price_levels price_levels_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.price_levels
    ADD CONSTRAINT price_levels_pkey PRIMARY KEY (id);


--
-- TOC entry 3772 (class 2606 OID 18516)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3765 (class 2606 OID 18250)
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- TOC entry 3715 (class 2606 OID 17153)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3717 (class 2606 OID 17155)
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- TOC entry 3709 (class 2606 OID 17131)
-- Name: quote_lines quote_lines_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quote_lines
    ADD CONSTRAINT quote_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 17133)
-- Name: quote_lines quote_lines_quote_line_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quote_lines
    ADD CONSTRAINT quote_lines_quote_line_key UNIQUE (quote_id, line_number);


--
-- TOC entry 3664 (class 2606 OID 16633)
-- Name: quotes quotes_account_id_quote_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quotes
    ADD CONSTRAINT quotes_account_id_quote_number_key UNIQUE (account_id, quote_number);


--
-- TOC entry 3666 (class 2606 OID 16631)
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- TOC entry 3721 (class 2606 OID 17187)
-- Name: shipments shipments_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_number_key UNIQUE (account_id, shipment_number);


--
-- TOC entry 3723 (class 2606 OID 17185)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 3675 (class 2606 OID 16701)
-- Name: statements statements_account_id_period_start_period_end_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.statements
    ADD CONSTRAINT statements_account_id_period_start_period_end_key UNIQUE (account_id, period_start, period_end);


--
-- TOC entry 3677 (class 2606 OID 16699)
-- Name: statements statements_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.statements
    ADD CONSTRAINT statements_pkey PRIMARY KEY (id);


--
-- TOC entry 3755 (class 2606 OID 18458)
-- Name: locations unq_location_code; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.locations
    ADD CONSTRAINT unq_location_code UNIQUE NULLS NOT DISTINCT (code);


--
-- TOC entry 3740 (class 2606 OID 17672)
-- Name: uom_conversions uom_conversions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.uom_conversions
    ADD CONSTRAINT uom_conversions_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 17674)
-- Name: uom_conversions uom_conversions_unique; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.uom_conversions
    ADD CONSTRAINT uom_conversions_unique UNIQUE (from_uom, to_uom, product_id);


--
-- TOC entry 3644 (class 2606 OID 18326)
-- Name: account_addresses ux_account_addresses_external_id; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_addresses
    ADD CONSTRAINT ux_account_addresses_external_id UNIQUE (external_id);


--
-- TOC entry 3638 (class 2606 OID 18324)
-- Name: accounts ux_accounts_external_id; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.accounts
    ADD CONSTRAINT ux_accounts_external_id UNIQUE (external_id);


--
-- TOC entry 3760 (class 2606 OID 18206)
-- Name: inventory ux_inventory_product_location; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.inventory
    ADD CONSTRAINT ux_inventory_product_location UNIQUE (product_id, location_id);


--
-- TOC entry 3775 (class 2606 OID 18551)
-- Name: product_categories ux_product_categories_external_id; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_categories
    ADD CONSTRAINT ux_product_categories_external_id UNIQUE (external_id);


--
-- TOC entry 3767 (class 2606 OID 18252)
-- Name: product_prices ux_product_prices; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_prices
    ADD CONSTRAINT ux_product_prices UNIQUE (product_id, price_level_id, uom, min_quantity);


--
-- TOC entry 3746 (class 2606 OID 17756)
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- TOC entry 3751 (class 2606 OID 17782)
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 17734)
-- Name: registry registry_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.registry
    ADD CONSTRAINT registry_pkey PRIMARY KEY (id);


--
-- TOC entry 3648 (class 1259 OID 16569)
-- Name: ix_auth_sessions_expires; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX ix_auth_sessions_expires ON auth.sessions USING btree (expires_at);


--
-- TOC entry 3649 (class 1259 OID 16568)
-- Name: ix_auth_sessions_user; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX ix_auth_sessions_user ON auth.sessions USING btree (user_id);


--
-- TOC entry 3650 (class 1259 OID 17813)
-- Name: ix_sessions_impersonator; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX ix_sessions_impersonator ON auth.sessions USING btree (impersonator_user_id) WHERE (impersonator_user_id IS NOT NULL);


--
-- TOC entry 3647 (class 1259 OID 16517)
-- Name: ux_auth_users_email; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX ux_auth_users_email ON auth.users USING btree (lower(email));


--
-- TOC entry 3642 (class 1259 OID 16495)
-- Name: ix_account_addresses_account; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_account_addresses_account ON core.account_addresses USING btree (account_id);


--
-- TOC entry 3731 (class 1259 OID 17579)
-- Name: ix_account_assignments_staff; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_account_assignments_staff ON core.account_assignments USING btree (user_id);


--
-- TOC entry 3633 (class 1259 OID 16490)
-- Name: ix_accounts_email; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_accounts_email ON core.accounts USING btree (email);


--
-- TOC entry 3634 (class 1259 OID 16489)
-- Name: ix_accounts_external_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_accounts_external_id ON core.accounts USING btree (external_id);


--
-- TOC entry 3635 (class 1259 OID 17685)
-- Name: ix_accounts_parent; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_accounts_parent ON core.accounts USING btree (parent_account_id);


--
-- TOC entry 3636 (class 1259 OID 17245)
-- Name: ix_accounts_type; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_accounts_type ON core.accounts USING btree (type);


--
-- TOC entry 3732 (class 1259 OID 17627)
-- Name: ix_assignments_user; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_assignments_user ON core.account_assignments USING btree (user_id);


--
-- TOC entry 3735 (class 1259 OID 17646)
-- Name: ix_audit_logs_event_time; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_audit_logs_event_time ON core.audit_logs USING btree (event_type, created_at DESC);


--
-- TOC entry 3736 (class 1259 OID 17647)
-- Name: ix_audit_logs_user_time; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_audit_logs_user_time ON core.audit_logs USING btree (user_id, created_at DESC) WHERE (user_id IS NOT NULL);


--
-- TOC entry 3770 (class 1259 OID 18293)
-- Name: ix_contract_prices_lookup; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_contract_prices_lookup ON core.contract_prices USING btree (account_id, product_id, job_id, end_date);


--
-- TOC entry 3758 (class 1259 OID 18217)
-- Name: ix_inventory_product; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_inventory_product ON core.inventory USING btree (product_id);


--
-- TOC entry 3706 (class 1259 OID 17109)
-- Name: ix_invoice_lines_invoice; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_invoice_lines_invoice ON core.invoice_lines USING btree (invoice_id);


--
-- TOC entry 3671 (class 1259 OID 16678)
-- Name: ix_invoices_account_date; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_invoices_account_date ON core.invoices USING btree (account_id, invoice_date DESC);


--
-- TOC entry 3672 (class 1259 OID 17046)
-- Name: ix_invoices_job; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_invoices_job ON core.invoices USING btree (job_id);


--
-- TOC entry 3692 (class 1259 OID 17029)
-- Name: ix_jobs_account_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_jobs_account_active ON core.jobs USING btree (account_id, is_active);


--
-- TOC entry 3697 (class 1259 OID 17108)
-- Name: ix_order_lines_order; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_order_lines_order ON core.order_lines USING btree (order_id);


--
-- TOC entry 3655 (class 1259 OID 16605)
-- Name: ix_orders_account_date; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_orders_account_date ON core.orders USING btree (account_id, order_date DESC);


--
-- TOC entry 3656 (class 1259 OID 17045)
-- Name: ix_orders_job; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_orders_job ON core.orders USING btree (job_id);


--
-- TOC entry 3682 (class 1259 OID 16765)
-- Name: ix_payment_allocations_invoice; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_payment_allocations_invoice ON core.payment_allocations USING btree (invoice_id);


--
-- TOC entry 3683 (class 1259 OID 16764)
-- Name: ix_payment_allocations_payment; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_payment_allocations_payment ON core.payment_allocations USING btree (payment_id);


--
-- TOC entry 3678 (class 1259 OID 16740)
-- Name: ix_payment_transactions_account_time; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_payment_transactions_account_time ON core.payment_transactions USING btree (account_id, submitted_at DESC);


--
-- TOC entry 3679 (class 1259 OID 16823)
-- Name: ix_payment_transactions_status; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_payment_transactions_status ON core.payment_transactions USING btree (status);


--
-- TOC entry 3763 (class 1259 OID 18263)
-- Name: ix_product_prices_lookup; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_product_prices_lookup ON core.product_prices USING btree (product_id, price_level_id);


--
-- TOC entry 3712 (class 1259 OID 18528)
-- Name: ix_products_category_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_products_category_id ON core.products USING btree (category_id);


--
-- TOC entry 3713 (class 1259 OID 17156)
-- Name: ix_products_search; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_products_search ON core.products USING btree (name text_pattern_ops);


--
-- TOC entry 3707 (class 1259 OID 17139)
-- Name: ix_quote_lines_quote; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_quote_lines_quote ON core.quote_lines USING btree (quote_id);


--
-- TOC entry 3661 (class 1259 OID 16639)
-- Name: ix_quotes_account_date; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_quotes_account_date ON core.quotes USING btree (account_id, quote_date DESC);


--
-- TOC entry 3662 (class 1259 OID 17047)
-- Name: ix_quotes_job; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_quotes_job ON core.quotes USING btree (job_id);


--
-- TOC entry 3718 (class 1259 OID 17209)
-- Name: ix_shipments_job; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_shipments_job ON core.shipments USING btree (job_id);


--
-- TOC entry 3719 (class 1259 OID 17208)
-- Name: ix_shipments_order; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_shipments_order ON core.shipments USING btree (order_id);


--
-- TOC entry 3673 (class 1259 OID 16707)
-- Name: ix_statements_account_period; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX ix_statements_account_period ON core.statements USING btree (account_id, period_end DESC);


--
-- TOC entry 3639 (class 1259 OID 16488)
-- Name: ux_accounts_number; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX ux_accounts_number ON core.accounts USING btree (number) WHERE (number IS NOT NULL);


--
-- TOC entry 3773 (class 1259 OID 18522)
-- Name: ux_categories_external_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX ux_categories_external_id ON core.product_categories USING btree (external_id) WHERE (external_id IS NOT NULL);


--
-- TOC entry 3726 (class 1259 OID 17236)
-- Name: ux_payment_methods_default; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX ux_payment_methods_default ON core.payment_methods USING btree (account_id, type) WHERE (is_default = true);


--
-- TOC entry 3747 (class 1259 OID 17768)
-- Name: ix_batches_history; Type: INDEX; Schema: integrations; Owner: postgres
--

CREATE INDEX ix_batches_history ON integrations.batches USING btree (integration_id, started_at DESC);


--
-- TOC entry 3748 (class 1259 OID 17767)
-- Name: ix_batches_status; Type: INDEX; Schema: integrations; Owner: postgres
--

CREATE INDEX ix_batches_status ON integrations.batches USING btree (status);


--
-- TOC entry 3749 (class 1259 OID 17788)
-- Name: ix_logs_batch; Type: INDEX; Schema: integrations; Owner: postgres
--

CREATE INDEX ix_logs_batch ON integrations.logs USING btree (batch_id);


--
-- TOC entry 3831 (class 2620 OID 17791)
-- Name: batches trg_update_registry_after_batch; Type: TRIGGER; Schema: integrations; Owner: postgres
--

CREATE TRIGGER trg_update_registry_after_batch AFTER UPDATE ON integrations.batches FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION integrations.update_registry_status();


--
-- TOC entry 3802 (class 2606 OID 18437)
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3783 (class 2606 OID 17803)
-- Name: sessions sessions_active_account_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_active_account_id_fkey FOREIGN KEY (active_account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3784 (class 2606 OID 17808)
-- Name: sessions sessions_impersonator_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_impersonator_user_id_fkey FOREIGN KEY (impersonator_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3785 (class 2606 OID 16563)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3782 (class 2606 OID 17603)
-- Name: users users_account_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3813 (class 2606 OID 17478)
-- Name: account_assignments account_assignments_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_assignments
    ADD CONSTRAINT account_assignments_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 3814 (class 2606 OID 17483)
-- Name: account_assignments account_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_assignments
    ADD CONSTRAINT account_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3830 (class 2606 OID 18568)
-- Name: account_summaries account_summaries_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_summaries
    ADD CONSTRAINT account_summaries_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 3778 (class 2606 OID 18229)
-- Name: accounts accounts_default_price_level_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.accounts
    ADD CONSTRAINT accounts_default_price_level_id_fkey FOREIGN KEY (default_price_level_id) REFERENCES core.price_levels(id);


--
-- TOC entry 3779 (class 2606 OID 18309)
-- Name: accounts accounts_home_location_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.accounts
    ADD CONSTRAINT accounts_home_location_id_fkey FOREIGN KEY (home_location_id) REFERENCES core.locations(id);


--
-- TOC entry 3780 (class 2606 OID 17680)
-- Name: accounts accounts_parent_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.accounts
    ADD CONSTRAINT accounts_parent_account_id_fkey FOREIGN KEY (parent_account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3815 (class 2606 OID 17814)
-- Name: audit_logs audit_logs_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.audit_logs
    ADD CONSTRAINT audit_logs_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3816 (class 2606 OID 17568)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3817 (class 2606 OID 17640)
-- Name: configuration configuration_updated_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.configuration
    ADD CONSTRAINT configuration_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- TOC entry 3826 (class 2606 OID 18278)
-- Name: contract_prices contract_prices_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.contract_prices
    ADD CONSTRAINT contract_prices_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 3827 (class 2606 OID 18283)
-- Name: contract_prices contract_prices_job_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.contract_prices
    ADD CONSTRAINT contract_prices_job_id_fkey FOREIGN KEY (job_id) REFERENCES core.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 3828 (class 2606 OID 18288)
-- Name: contract_prices contract_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.contract_prices
    ADD CONSTRAINT contract_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES core.products(id) ON DELETE CASCADE;


--
-- TOC entry 3801 (class 2606 OID 16779)
-- Name: documents documents_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.documents
    ADD CONSTRAINT documents_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3781 (class 2606 OID 16418)
-- Name: account_addresses fk_account_address; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.account_addresses
    ADD CONSTRAINT fk_account_address FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3795 (class 2606 OID 16785)
-- Name: statements fk_statements_document; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.statements
    ADD CONSTRAINT fk_statements_document FOREIGN KEY (document_id) REFERENCES core.documents(id) ON DELETE SET NULL;


--
-- TOC entry 3822 (class 2606 OID 18212)
-- Name: inventory inventory_location_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.inventory
    ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES core.locations(id) ON DELETE CASCADE;


--
-- TOC entry 3823 (class 2606 OID 18207)
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES core.products(id) ON DELETE CASCADE;


--
-- TOC entry 3805 (class 2606 OID 17103)
-- Name: invoice_lines invoice_lines_invoice_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoice_lines
    ADD CONSTRAINT invoice_lines_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES core.invoices(id) ON DELETE CASCADE;


--
-- TOC entry 3792 (class 2606 OID 16672)
-- Name: invoices invoices_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoices
    ADD CONSTRAINT invoices_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3793 (class 2606 OID 17035)
-- Name: invoices invoices_job_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoices
    ADD CONSTRAINT invoices_job_id_fkey FOREIGN KEY (job_id) REFERENCES core.jobs(id) ON DELETE SET NULL;


--
-- TOC entry 3794 (class 2606 OID 18294)
-- Name: invoices invoices_location_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.invoices
    ADD CONSTRAINT invoices_location_id_fkey FOREIGN KEY (location_id) REFERENCES core.locations(id);


--
-- TOC entry 3803 (class 2606 OID 17024)
-- Name: jobs jobs_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.jobs
    ADD CONSTRAINT jobs_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 3804 (class 2606 OID 17075)
-- Name: order_lines order_lines_order_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.order_lines
    ADD CONSTRAINT order_lines_order_id_fkey FOREIGN KEY (order_id) REFERENCES core.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3786 (class 2606 OID 16600)
-- Name: orders orders_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3787 (class 2606 OID 17030)
-- Name: orders orders_job_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_job_id_fkey FOREIGN KEY (job_id) REFERENCES core.jobs(id) ON DELETE SET NULL;


--
-- TOC entry 3788 (class 2606 OID 18299)
-- Name: orders orders_location_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.orders
    ADD CONSTRAINT orders_location_id_fkey FOREIGN KEY (location_id) REFERENCES core.locations(id);


--
-- TOC entry 3799 (class 2606 OID 16759)
-- Name: payment_allocations payment_allocations_invoice_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_allocations
    ADD CONSTRAINT payment_allocations_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES core.invoices(id);


--
-- TOC entry 3800 (class 2606 OID 16754)
-- Name: payment_allocations payment_allocations_payment_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_allocations
    ADD CONSTRAINT payment_allocations_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES core.payment_transactions(id) ON DELETE CASCADE;


--
-- TOC entry 3812 (class 2606 OID 17231)
-- Name: payment_methods payment_methods_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_methods
    ADD CONSTRAINT payment_methods_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 3797 (class 2606 OID 16730)
-- Name: payment_transactions payment_transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_transactions
    ADD CONSTRAINT payment_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3798 (class 2606 OID 16735)
-- Name: payment_transactions payment_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- TOC entry 3829 (class 2606 OID 18517)
-- Name: product_categories product_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_categories
    ADD CONSTRAINT product_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES core.product_categories(id);


--
-- TOC entry 3824 (class 2606 OID 18258)
-- Name: product_prices product_prices_price_level_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_prices
    ADD CONSTRAINT product_prices_price_level_id_fkey FOREIGN KEY (price_level_id) REFERENCES core.price_levels(id) ON DELETE CASCADE;


--
-- TOC entry 3825 (class 2606 OID 18253)
-- Name: product_prices product_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES core.products(id) ON DELETE CASCADE;


--
-- TOC entry 3807 (class 2606 OID 18523)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES core.product_categories(id);


--
-- TOC entry 3806 (class 2606 OID 17134)
-- Name: quote_lines quote_lines_quote_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quote_lines
    ADD CONSTRAINT quote_lines_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES core.quotes(id) ON DELETE CASCADE;


--
-- TOC entry 3789 (class 2606 OID 16634)
-- Name: quotes quotes_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quotes
    ADD CONSTRAINT quotes_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3790 (class 2606 OID 17040)
-- Name: quotes quotes_job_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quotes
    ADD CONSTRAINT quotes_job_id_fkey FOREIGN KEY (job_id) REFERENCES core.jobs(id) ON DELETE SET NULL;


--
-- TOC entry 3791 (class 2606 OID 18304)
-- Name: quotes quotes_location_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.quotes
    ADD CONSTRAINT quotes_location_id_fkey FOREIGN KEY (location_id) REFERENCES core.locations(id);


--
-- TOC entry 3808 (class 2606 OID 17188)
-- Name: shipments shipments_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3809 (class 2606 OID 17198)
-- Name: shipments shipments_job_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_job_id_fkey FOREIGN KEY (job_id) REFERENCES core.jobs(id);


--
-- TOC entry 3810 (class 2606 OID 17193)
-- Name: shipments shipments_order_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_order_id_fkey FOREIGN KEY (order_id) REFERENCES core.orders(id);


--
-- TOC entry 3811 (class 2606 OID 17203)
-- Name: shipments shipments_pod_document_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.shipments
    ADD CONSTRAINT shipments_pod_document_id_fkey FOREIGN KEY (pod_document_id) REFERENCES core.documents(id);


--
-- TOC entry 3796 (class 2606 OID 16702)
-- Name: statements statements_account_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.statements
    ADD CONSTRAINT statements_account_id_fkey FOREIGN KEY (account_id) REFERENCES core.accounts(id);


--
-- TOC entry 3818 (class 2606 OID 17675)
-- Name: uom_conversions uom_conversions_product_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.uom_conversions
    ADD CONSTRAINT uom_conversions_product_id_fkey FOREIGN KEY (product_id) REFERENCES core.products(id) ON DELETE CASCADE;


--
-- TOC entry 3819 (class 2606 OID 17757)
-- Name: batches batches_integration_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.batches
    ADD CONSTRAINT batches_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES integrations.registry(id);


--
-- TOC entry 3820 (class 2606 OID 17762)
-- Name: batches batches_triggered_by_user_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.batches
    ADD CONSTRAINT batches_triggered_by_user_id_fkey FOREIGN KEY (triggered_by_user_id) REFERENCES auth.users(id);


--
-- TOC entry 3821 (class 2606 OID 17783)
-- Name: logs logs_batch_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.logs
    ADD CONSTRAINT logs_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES integrations.batches(id) ON DELETE CASCADE;


-- Completed on 2026-01-14 12:24:32 EST

--
-- PostgreSQL database dump complete
--

\unrestrict zwAwqae4qDh4YLYgqytd829ic3INmwVRDdubUGSG1e11zGjchVKGMHL5RaWSjdG

