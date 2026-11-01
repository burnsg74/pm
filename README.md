# PM

Keyboard-first GTD project manager for the Work vault. `http://pm.localhost`

- Frontend: Vite + Svelte 5 (plain JS), FullCalendar, Vim-style modal keys, Zed-like themes
- Backend: Node `http` on `127.0.0.1:4000` (pm2 `pm-api`), vault I/O only
- Data: `$VAULT_PATH/10 Projects/PM/data/` (`tasks.csv`, `projects.csv`, `reviews/YYYY-MM-DD.md`); edits made in Obsidian/Dropbox show up on window focus

## Develop

```
npm run dev      # API on :4000 (data/dev) + Vite on :5170
npm test
```

## Deploy

```
deploy/setup.sh     # idempotent: seed missing vault data, build, nginx link, hosts, pm2 + save, verify
deploy/deploy.sh    # later updates
deploy/teardown.sh  # remove nginx site, pm2 process, hosts lines (vault data untouched)
```

Setup never overwrites vault data. If `/etc/hosts` or a root-owned nginx can't be edited non-interactively, it prints the exact commands to run.
If the API can't read the vault under pm2, grant the node binary in `deploy/ecosystem.config.cjs` Full Disk Access and `pm2 restart pm-api`.

## Keys

`?` opens the full help; `Cmd+P` / `Space Space` quick open; `Cmd+Shift+P` / `:` commands.
`j k` move, `gi gt gn gw gs gm gp gc gr gd` go to Inbox/Today/Next/Waiting/Scheduled/Someday/Projects/Calendar/Review/Done,
`a` capture (`Buy cables @errands #home due:fri`), `x` done, `p @ t T W` set project/context/due/start/waiting,
`P` process inbox, `v` visual select, `u` / `Ctrl-r` undo/redo.
