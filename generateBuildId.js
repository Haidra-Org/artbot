// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

function generateBuildId() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}.${minutes}.${seconds}`;
}

const buildId = generateBuildId();
const buildIdJson = JSON.stringify({ buildId }, null, 2);

fs.writeFileSync('buildId.json', buildIdJson);

console.log(`Build ID generated: ${buildId}`);
