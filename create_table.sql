CREATE TABLE IF NOT EXISTS public.t_user
(
    id bigserial NOT NULL,
    name text NOT NULL,
    "userName" text NOT NULL,
    password text NOT NULL,
    email text,
    mobile text,
    photo text,
    role integer NOT NULL DEFAULT 3,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.t_role
(
    id integer NOT NULL,
    "roleName" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT t_role_pkey PRIMARY KEY (id)
)
