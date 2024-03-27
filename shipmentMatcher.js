const fs = require('fs');
const gcd = (a, b) => {
    while (b != 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

const countVowels = (str) => (str.match(/[aeiou]/gi) || []).length;
const countConsonants = (str) => (str.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;

const assignDriversToAddressesOptimized = (drivers, addresses) => {
    const scoresMatrix = [];
    for (let driver of drivers) {
        const driverScores = [];
        const driverLength = driver.length;
        const vowelCount = countVowels(driver);
        const consonantCount = countConsonants(driver);
        for (let address of addresses) {
            const addressLength = address.length;
            let baseScore = addressLength % 2 === 0 ? 1.5 * vowelCount : consonantCount;
            if (gcd(driverLength, addressLength) > 1) {
                baseScore *= 1.5;
            }
            driverScores.push(baseScore);
        };
        scoresMatrix.push(driverScores);
    };

    const usedDrivers = new Set();
    const usedAddresses = new Set();
    const assignments = [];
    let totalScore = 0;

    for (let i = 0; i < drivers.length; i++) {
        let bestScore = -1;
        let bestPair = null;
        for (let j = 0; j < addresses.length; j++) {
            if (!usedDrivers.has(i) && !usedAddresses.has(j) && scoresMatrix[i][j] > bestScore) {
                bestScore = scoresMatrix[i][j];
                bestPair = { driverIndex: i, addressIndex: j, score: bestScore };
            }
        }
        if (bestPair) {
            usedDrivers.add(bestPair.driverIndex);
            usedAddresses.add(bestPair.addressIndex);
            assignments.push({ driver: drivers[bestPair.driverIndex], address: addresses[bestPair.addressIndex], score: bestPair.score });
            totalScore += bestPair.score;
        }
    }

    return { totalScore, assignments };
}

const streetFile = process.argv[2];
const driverFile = process.argv[3];
if (!streetFile || !driverFile) {
    console.log('Usage: node shipmentMatcher.js <StreetAddressesFile> <DriverNamesFile>')
}

const addresses = fs.readFileSync(streetFile, 'utf8').split('\n');
const drivers = fs.readFileSync(driverFile, 'utf8').split('\n');
const result = assignDriversToAddressesOptimized(drivers, addresses);
console.log(`Total Suitability Score: ${result.totalScore}`);
console.log('Assignments:');
result.assignments.forEach(({ driver, address, score }) => {
    console.log(`${driver} -> ${address} (Score: ${score})`);
});