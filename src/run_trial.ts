import {
  set_trial_context,
  type StimBank,
  type TaskSettings,
  type TrialBuilder,
  type TrialSnapshot
} from "psyflow-web";

function resolveFeedbackLabel(
  snapshot: TrialSnapshot
): "correct_feedback" | "incorrect_feedback" | "no_response_feedback" {
  const response = snapshot.units.stimulus?.response;
  const hit = snapshot.units.stimulus?.hit;
  if (response && hit === true) {
    return "correct_feedback";
  }
  if (response && hit === false) {
    return "incorrect_feedback";
  }
  return "no_response_feedback";
}

export function run_trial(
  trial: TrialBuilder,
  condition: string,
  context: {
    settings: TaskSettings;
    stimBank: StimBank;
    block_id: string;
    block_idx: number;
  }
): TrialBuilder {
  const { settings, stimBank, block_id, block_idx } = context;
  const condition_id = String(condition);
  const [stroop_type, color] = condition_id.split("_");
  const red_key = String(settings.red_key ?? "f");
  const green_key = String(settings.green_key ?? "j");
  const key_list = ((settings.key_list as string[]) ?? [red_key, green_key]).map(String);
  const correct_response = color === "red" ? red_key : green_key;
  const trigger_map = (settings.triggers ?? {}) as Record<string, unknown>;

  const fixationUnit = trial.unit("fixation").addStim(stimBank.get("fixation"));
  set_trial_context(fixationUnit, {
    trial_id: trial.trial_id,
    phase: "pre_stim_fixation",
    deadline_s: Number(settings.fixation_duration ?? 0.5),
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "pre_stim_fixation",
      stroop_type,
      color,
      block_idx
    },
    stim_id: "fixation"
  });
  fixationUnit.show({ duration: Number(settings.fixation_duration ?? 0.5) }).to_dict();

  const stimulusUnit = trial.unit("stimulus").addStim(stimBank.get(condition_id));
  set_trial_context(stimulusUnit, {
    trial_id: trial.trial_id,
    phase: "stroop_response",
    deadline_s: Number(settings.stim_duration ?? 2),
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "stroop_response",
      stroop_type,
      color,
      correct_key: correct_response,
      block_idx
    },
    stim_id: condition_id
  });
  stimulusUnit
    .captureResponse({
      keys: key_list,
      correct_keys: [correct_response],
      duration: Number(settings.stim_duration ?? 2),
      response_trigger: {
        [red_key]: Number(trigger_map.red_key_press ?? 30),
        [green_key]: Number(trigger_map.green_key_press ?? 31)
      },
      terminate_on_response: true
    })
    .to_dict();

  const feedbackUnit = trial
    .unit("feedback")
    .addStim((snapshot: TrialSnapshot) => stimBank.get(resolveFeedbackLabel(snapshot)));
  set_trial_context(feedbackUnit, {
    trial_id: trial.trial_id,
    phase: "outcome_feedback",
    deadline_s: Number(settings.feedback_duration ?? 0.5),
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "outcome_feedback",
      block_idx
    }
  });
  feedbackUnit.show({ duration: Number(settings.feedback_duration ?? 0.5) }).to_dict();

  const itiUnit = trial.unit("iti");
  set_trial_context(itiUnit, {
    trial_id: trial.trial_id,
    phase: "inter_trial_interval",
    deadline_s: (settings.iti_duration as number | number[] | null | undefined) ?? null,
    valid_keys: [...key_list],
    block_id,
    condition_id,
    task_factors: {
      condition: condition_id,
      stage: "inter_trial_interval",
      block_idx
    }
  });
  itiUnit.show({ duration: (settings.iti_duration as number | number[] | null | undefined) ?? null }).to_dict();

  return trial;
}
