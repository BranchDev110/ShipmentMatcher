const fs = require('fs');
const munkres = require('munkres-js');
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
            driverScores.push(1000 - baseScore);
        };
        scoresMatrix.push(driverScores);
    };

    const assignments = munkres(scoresMatrix);
    let totalScore = 0;
    const detailedAssignments = assignments.map(([driverIndex, addressIndex]) => {
        const score = 1000 - scoresMatrix[driverIndex][addressIndex]; // Convert back to original score
        totalScore += score;
        return { driver: drivers[driverIndex], address: addresses[addressIndex], score };
    });

    return { totalScore, detailedAssignments };
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
result.detailedAssignments.forEach(({ driver, address, score }) => {
    console.log(`${driver} -> ${address} (Score: ${score})`);
});