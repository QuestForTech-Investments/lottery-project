#!/usr/bin/env bash
# Run the Lottery API locally as the La Central tenant.
# Defaults to port 5001 (same port as Lottobook — stop the other one first,
# or override with PORT=5002 ./scripts/run-api-lacentral.sh to run both).
#
# Every env var below mirrors what's set on the lacentral-api-prod App
# Service in Azure, so local behavior matches production.

set -euo pipefail

PORT="${PORT:-5001}"

export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"

# La Central production DB (lottery-db-lacentral) — NOT a local copy. Anything
# you change locally hits the real La Central data.
export ConnectionStrings__DefaultConnection="Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db-lacentral;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Tenant identity used by the cross-tenant public API and by sync logs.
export PublicApi__TenantCode="lacentral"
export PublicApi__TenantName="La Central"
export PublicApi__Currency="USD"

# Shared secret partners use to authenticate cross-tenant pushes (X-Central-Key
# header). Must match the value Lottobook has registered for this partner.
export PublicApi__CentralKey="ad77b0654dec5f15705eb09f24e8dfbe589ec7cc2e0e1d2ee773139c6563c69c"

# Banca code prefix — LC- so new bancas issue codes like LC-0601.
export BettingPool__CodePrefix="LC-"

# Repo root is the script's parent's parent.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ La Central API on http://localhost:${PORT}"
dotnet run --project "${REPO_ROOT}/api/src/LotteryApi" --urls "http://0.0.0.0:${PORT}"
