#!/usr/bin/env bash
set -Eeuo pipefail

# The docs workflow can be triggered concurrently by a push, release, or manual run.
# Refresh the deployment branch before each attempt so mike never pushes from a stale
# local gh-pages ref. A short retry loop also handles a branch update that lands
# between fetch and push.
for attempt in 1 2 3 4 5; do
  if git ls-remote --exit-code origin refs/heads/gh-pages >/dev/null 2>&1; then
    git fetch --quiet origin gh-pages
    git branch --force gh-pages origin/gh-pages
  fi

  if mike deploy "$@" --push; then
    exit 0
  fi

  if [[ "$attempt" -eq 5 ]]; then
    echo "mike deployment failed after ${attempt} attempts" >&2
    exit 1
  fi

  delay=$((attempt * 10))
  echo "mike deployment attempt ${attempt} failed; retrying in ${delay}s" >&2
  sleep "$delay"
done
