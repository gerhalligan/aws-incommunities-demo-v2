ALTER TABLE public.question_answers
DROP CONSTRAINT IF EXISTS question_answers_unique_answer;

ALTER TABLE public.question_answers
ADD CONSTRAINT question_answers_unique_answer UNIQUE (
  user_id,
  question_id,
  application_id,
  parent_repeater_id,
  branch_entry_id
);

DROP INDEX IF EXISTS idx_question_answers_lookup;

CREATE INDEX idx_question_answers_lookup ON public.question_answers USING btree (
  user_id,
  question_id,
  application_id,
  parent_repeater_id,
  branch_entry_id,
  created_at DESC
) TABLESPACE pg_default;