#!/usr/bin/env bash
# Run the Lottery API locally as the Lottobook tenant.
# Defaults to port 5001; override with PORT=5002 ./scripts/run-api-lottobook.sh
#
# Tenant behavior comes from defaults baked into appsettings — no env var
# overrides are strictly required, but we set them explicitly so the runtime
# config matches Lottobook's production App Service.

set -euo pipefail

PORT="${PORT:-5001}"

export DOTNET_ROOT="/opt/homebrew/opt/dotnet@8/libexec"
export PATH="/opt/homebrew/opt/dotnet@8/bin:$PATH"

# Lottobook production DB. Same SQL server, different catalog from La Central.
export ConnectionStrings__DefaultConnection="Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Tenant identity used by the cross-tenant public API.
export PublicApi__TenantCode="lottobook"
export PublicApi__TenantName="Lottobook"
export PublicApi__Currency="DOP"

# Banca code prefix — LB- is the historical default for Lottobook.
export BettingPool__CodePrefix="LB-"

# Repo root is the script's parent's parent.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ Lottobook API on http://localhost:${PORT}"
dotnet run --project "${REPO_ROOT}/api/src/LotteryApi" --urls "http://0.0.0.0:${PORT}"
