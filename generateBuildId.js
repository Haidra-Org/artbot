// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

function generateBuildId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

const buildId = generateBuildId();
const buildIdJson = JSON.stringify({ buildId }, null, 2);

fs.writeFileSync('buildId.json', buildIdJson);

console.log(`Build ID generated: ${buildId}`);