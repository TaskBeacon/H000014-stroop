# H000014 Stroop

HTML/browser preview of the Stroop task built with `psyflow-web`.
The trial procedure, congruent/incongruent condition semantics, key mapping, and feedback logic are aligned to local `T000014-stroop`; block/trial counts are shortened for preview.

## Layout

- `main.ts`: task orchestration
- `config/config.yaml`: declarative config
- `src/run_trial.ts`: trial logic
- `src/utils.ts`: block accuracy summary helper

## Run

From `e:\xhmhc\TaskBeacon\psyflow-web`:

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4173/?task=H000014-stroop
```
