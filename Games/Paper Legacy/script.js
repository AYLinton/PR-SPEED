var data = {
  boxes: {
    credit: {
      size: 10,
      contents: [],
      cooldownDraw: 30,
      
      sizeCostBase: 100,
      sizeCostGrowth: 1.07,

      cooldownRefillUpgrades: 0,
      cooldownRefillBase: 1000,
      refillSpeedDecay: 0.04,
      refillCostBase: 100,
      refillCostGrowth: 1.09,
      
      minPaperRange: 3,
      minRangeCostGrowth: 1.15,
      minRangeCostBase: 869.565,
      maxPaperRange: 10,
      maxRangeCostGrowth: 50,
    }
  },
  currencies: {
    credit: 10000000000000000
  }
}
var boxStatus = {
  credit: {
    lastPaperDrawn: 0,
    cooldownDraw: 0,
    cooldownRefill: 0
  }
}

var numberRange = [];
var refreshRate = 30;

function refillBox(boxType) {
  data.boxes[boxType].contents.length = 0;
  var shuffledNumbers = [];
  var numberRange = [];

  for (let i = data.boxes[boxType].minPaperRange; i <= data.boxes[boxType].maxPaperRange; i++) {
    numberRange.push(i);
  }

  for (let i = 0; i < Math.ceil(data.boxes[boxType].size / (data.boxes[boxType].maxPaperRange - data.boxes[boxType].minPaperRange + 1)); i++) {
    shuffledNumbers.push(...numberRange);
    console.log(...numberRange);
	}
  
  shuffledNumbers = shuffledNumbers.slice(0, data.boxes[boxType].size)
  for (let i = shuffledNumbers.length - 1; i > 0; i--) {
    const u = Math.floor(Math.random() * (i + 1));
		[shuffledNumbers[i], shuffledNumbers[u]] = [shuffledNumbers[u], shuffledNumbers[i]];
	}

  data.boxes[boxType].contents = [ ...shuffledNumbers.slice(0, data.boxes[boxType].size) ];
  console.log(data.boxes["credit"].contents)
}
refillBox("credit");

document.getElementById("draw-paper-credit").addEventListener("click", () => {
  if (boxStatus["credit"].cooldownDraw <= 0 && boxStatus["credit"].cooldownRefill <= 0) {
    if (data.boxes["credit"].contents.length <= 0) {
      boxStatus["credit"].cooldownRefill = Number(document.getElementById("base-cooldown-time-credit").innerHTML.slice(0, -1).replace("Base Refill Cooldown: ", "")) * 1000;
      return;
    }
    data.currencies["credit"] += data.boxes["credit"].contents[0];
    boxStatus["credit"].lastPaperDrawn = data.boxes["credit"].contents[0];
    data.boxes["credit"].contents.shift();
    boxStatus["credit"].cooldownDraw = data.boxes["credit"].cooldownDraw;
    if (data.boxes["credit"].contents.length <= 0) boxStatus["credit"].cooldownRefill = Number(document.getElementById("base-cooldown-time-credit").innerHTML.slice(0, -1).replace("Base Refill Cooldown: ", "")) * 1000;
    // console.log(Number(document.getElementById("base-cooldown-time-credit").innerHTML.slice(0, -1).replace("Base Refill Cooldown: ", "")) * 1000);
  }
});

document.getElementById("upgrade-range-credit").addEventListener("click", () => {
	if (data.currencies.credit >= (data.boxes["credit"].maxPaperRange - 9) * 50) {
    data.currencies.credit -= (data.boxes["credit"].maxPaperRange - 9) * 50;
    data.boxes["credit"].maxPaperRange += 1;
  }
});

document.getElementById("upgrade-size-credit").addEventListener("click", () => {
  if (data.currencies.credit >= data.boxes["credit"].sizeCostBase * Math.pow(data.boxes["credit"].sizeCostGrowth, data.boxes["credit"].size - 10)) {
    data.currencies.credit -= (data.boxes["credit"].sizeCostBase * Math.pow(data.boxes["credit"].sizeCostGrowth, data.boxes["credit"].size - 10)).toFixed(2);
    data.boxes["credit"].size += 1;
  }
})

document.getElementById("upgrade-refill-credit").addEventListener("click", () => {
  if (data.boxes["credit"].refillCostBase * Math.pow(data.boxes["credit"].refillCostGrowth, data.boxes["credit"].cooldownRefillUpgrades - 1)) {
    data.currencies.credit -= (data.boxes["credit"].refillCostBase * Math.pow(data.boxes["credit"].refillCostGrowth, data.boxes["credit"].cooldownRefillUpgrades - 1)).toFixed(2);
    data.boxes["credit"].cooldownRefillUpgrades += 1;
  }
})

document.getElementById("upgrade-min-credit").addEventListener("click", () => {
	if (exponentialNextCost(data.boxes["credit"].minRangeCostBase, data.boxes["credit"].minRangeCostGrowth, data.boxes["credit"].minPaperRange)) {
		data.currencies.credit -= exponentialNextCost(data.boxes["credit"].minRangeCostBase, data.boxes["credit"].minRangeCostGrowth, data.boxes["credit"].minPaperRange);
		data.boxes["credit"].minPaperRange += 1;
	}
});

function updateCooldowns() {
  if (boxStatus["credit"].cooldownDraw > 0) boxStatus["credit"].cooldownDraw -= refreshRate;
  if (boxStatus["credit"].cooldownRefill > 0) {
    boxStatus["credit"].cooldownRefill -= refreshRate;
    if (boxStatus["credit"].cooldownRefill <= 0) {refillBox("credit"); boxStatus["credit"].cooldownRefill = 0}
  }
}

function draw() {
  document.getElementById("credit-amount").innerHTML = `Credits: ${data.currencies["credit"].toFixed(2)}`;
  document.getElementById("paper-left-credit").innerHTML = `Papers Left: ${data.boxes["credit"].contents.length}`;
  document.getElementById("last-paper-drawn-credit").innerHTML = `Paper Drawn: ${boxStatus["credit"].lastPaperDrawn}`;
  document.getElementById("cooldown-time-credit").innerHTML = `Refill Cooldown: ${(boxStatus["credit"].cooldownRefill / 1000).toFixed(2)}s`;
  document.getElementById("base-cooldown-time-credit").innerHTML = `Base Refill Cooldown: ${((data.boxes["credit"].cooldownRefillBase - exponentialDecay(data.boxes["credit"].cooldownRefillBase, data.boxes["credit"].refillSpeedDecay, data.boxes["credit"].cooldownRefillUpgrades)) / 1000).toFixed(2)}s`;
  document.getElementById("box-size-credit").innerHTML = `Box Size: ${data.boxes["credit"].size}`;
  document.getElementById("paper-range-credit").innerHTML = `Paper Range: ${data.boxes["credit"].minPaperRange} - ${(data.boxes["credit"].maxPaperRange)}`;

  document.getElementById("upgrade-range-credit").innerHTML = `Upgrade Paper Range (${(data.boxes["credit"].maxPaperRange - 9) * data.boxes["credit"].maxRangeCostGrowth} Credits)`;
  document.getElementById("upgrade-size-credit").innerHTML = `Upgrade Box Size (${exponentialNextCost(data.boxes["credit"].sizeCostBase, data.boxes["credit"].sizeCostGrowth, data.boxes["credit"].size - 10)} Credits)`;
  document.getElementById("upgrade-refill-credit").innerHTML = `Upgrade Refill Speed (${exponentialNextCost(data.boxes["credit"].refillCostBase, data.boxes["credit"].refillCostGrowth, data.boxes["credit"].cooldownRefillUpgrades)} Credits)`;
  document.getElementById("upgrade-min-credit").innerHTML = `Upgrade Min Paper (${exponentialNextCost(data.boxes["credit"].minRangeCostBase, data.boxes["credit"].minRangeCostGrowth, data.boxes["credit"].minPaperRange)} Credits)`;
}

function exponentialNextCost(base, growth, owned) {
  return (base * Math.pow(growth, owned)).toFixed(2);
}

function exponentialDecay(max, decay, owned) {
  return (max * (1 - Math.pow(Math.E, -1 * decay * owned))).toFixed(3)
}

var gameLoop = window.setInterval(() => {
  updateCooldowns();
  draw();
}, refreshRate)

var saveGameLoop = window.setInterval(() => {
  localStorage.setItem("paperLegacySave", JSON.stringify(data));
  console.log("Game Saved!")
}, 5000);

var savegame = JSON.parse(localStorage.getItem("paperLegacySave"))
if (savegame !== null) {
  data = savegame
  console.log("Game Loaded!")
} else {
  console.log("No Game File Found")
}

localStorage.clear();