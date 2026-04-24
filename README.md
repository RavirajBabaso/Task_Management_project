# Task_Management_project

This repository currently contains:

- `school-task-management/backend/` (active monorepo backend)
- `backend/` (legacy top-level backend)

## Legacy backend cleanup check

Before deleting the top-level `backend/`, run:

```bash
./scripts/check-legacy-backend.sh
```

If no references are found, follow a safe cleanup flow:

1. Rename `backend/` to `backend_legacy_backup/`.
2. Run your app/test/deploy commands.
3. If everything still works, remove the backup folder.
