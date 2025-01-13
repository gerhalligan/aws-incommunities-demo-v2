create table
  public.option_dependencies (
    id uuid not null default gen_random_uuid (),
    option_id text not null,
    dependent_question_id bigint not null,
    dependent_option_id text not null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint option_dependencies_pkey primary key (id),
    constraint option_dependencies_dependent_question_id_fkey foreign key (dependent_question_id) references questions (id) on delete cascade,
    constraint option_dependencies_option_id_fkey foreign key (option_id) references options (id) on delete cascade
  ) tablespace pg_default;

create table
  public.options (
    id text not null,
    question_id bigint null,
    text text not null,
    next_question_id bigint null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint options_pkey primary key (id)
  ) tablespace pg_default;

create table
  public.profiles (
    id uuid not null,
    role text not null default 'user'::text,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    display_name text null,
    phone_number text null,
    last_login timestamp with time zone null,
    constraint profiles_pkey primary key (id)
  ) tablespace pg_default;

create table
  public.question_answers (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    question_id integer not null,
    answer jsonb not null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    parent_repeater_id integer null,
    branch_entry_id text null,
    branch_entry_index integer null,
    constraint question_answers_pkey primary key (id),
    constraint question_answers_unique_answer unique (
      user_id,
      question_id,
      parent_repeater_id,
      branch_entry_id
    ),
    constraint question_answers_parent_repeater_id_fkey foreign key (parent_repeater_id) references questions (id),
    constraint answer_json_check check ((jsonb_typeof(answer) = 'object'::text)),
    constraint branch_entry_consistency check (
      (
        (
          (parent_repeater_id is null)
          and (branch_entry_id is null)
        )
        or (
          (parent_repeater_id is not null)
          and (branch_entry_id is not null)
        )
      )
    )
  ) tablespace pg_default;

create unique index if not exists question_answers_unique_main on public.question_answers using btree (user_id, question_id) tablespace pg_default
where
  (
    (parent_repeater_id is null)
    and (branch_entry_id is null)
  );

create index if not exists idx_question_answers_lookup on public.question_answers using btree (
  user_id,
  question_id,
  parent_repeater_id,
  branch_entry_id,
  created_at desc
) tablespace pg_default;

create table
  public.question_dependencies (
    id uuid not null default gen_random_uuid (),
    question_id bigint null,
    dependent_question_id bigint null,
    dependent_options text[] null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint question_dependencies_pkey primary key (id),
    constraint question_dependencies_question_id_dependent_question_id_key unique (question_id, dependent_question_id),
    constraint question_dependencies_dependent_question_id_fkey foreign key (dependent_question_id) references questions (id) on delete cascade,
    constraint question_dependencies_question_id_fkey foreign key (question_id) references questions (id) on delete cascade
  ) tablespace pg_default;

create table
  public.questions (
    id bigint not null,
    question text not null,
    type text not null,
    default_next_question_id bigint null,
    input_metadata jsonb null,
    file_upload_metadata jsonb null,
    ai_lookup jsonb null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    options jsonb not null default '[]'::jsonb,
    repeater_config jsonb null,
    question_order serial not null,
    constraint questions_pkey primary key (id),
    constraint questions_order_unique unique (question_order),
    constraint questions_default_next_question_id_fkey foreign key (default_next_question_id) references questions (id),
    constraint questions_options_check check ((jsonb_typeof(options) = 'array'::text)),
    constraint questions_repeater_config_check check (
      (
        (jsonb_typeof(repeater_config) is null)
        or (
          (jsonb_typeof(repeater_config) = 'object'::text)
          and (
            jsonb_typeof((repeater_config -> 'fields'::text)) = 'array'::text
          )
          and (
            ((repeater_config ->> 'minEntries'::text) is null)
            or (
              jsonb_typeof((repeater_config -> 'minEntries'::text)) = 'number'::text
            )
          )
          and (
            ((repeater_config ->> 'maxEntries'::text) is null)
            or (
              jsonb_typeof((repeater_config -> 'maxEntries'::text)) = 'number'::text
            )
          )
        )
      )
    ),
    constraint questions_type_check check (
      (
        type = any (
          array[
            'multiple-choice'::text,
            'input'::text,
            'repeater'::text
          ]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_questions_order on public.questions using btree (question_order) tablespace pg_default;

create table
  public.user_settings (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint user_settings_pkey primary key (id),
    constraint user_settings_user_id_key unique (user_id)
  ) tablespace pg_default;

create index if not exists idx_user_settings_user_id_unique on public.user_settings using btree (user_id) tablespace pg_default;