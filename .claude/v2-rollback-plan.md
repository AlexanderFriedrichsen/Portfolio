# v2 Rollback Plan — Windows XP Desktop Hero

**Deployed**: 2026-04-08
**PR**: https://github.com/AlexanderFriedrichsen/Portfolio/pull/2
**Merge commit**: `8cced205c1246382bf91ba1cbb1347d46f064945` (merge commit, two parents)
**Pre-merge main SHA**: `8df869ce3fbcc2151567345ca86150026b36d0cd` (PR #1, v1 retro desktop section)
**Deploy run**: https://github.com/AlexanderFriedrichsen/Portfolio/actions/runs/24116589872 (build 42s + deploy 10s)

## Preferred rollback (non-destructive)

```bash
cd /mnt/c/vault/dev/Portfolio
git checkout main && git pull
git revert -m 1 8cced205c1246382bf91ba1cbb1347d46f064945
git push origin main
```

`-m 1` keeps the first parent (pre-merge main = v1). GH Pages will redeploy automatically (~50s).

## Emergency rollback (destructive — only if revert fails)

```bash
cd /mnt/c/vault/dev/Portfolio
git checkout main && git pull
git reset --hard 8df869ce3fbcc2151567345ca86150026b36d0cd
git push --force-with-lease origin main
```

Requires CEO sign-off — destructive, rewrites main. Use revert path first.

## Post-rollback verification

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://honestafblog.com/Portfolio/
curl -s https://honestafblog.com/Portfolio/ | grep -c "xp-scope"  # should be 0 after rollback to v1
```
