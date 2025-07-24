/*
 * Poopster Game Logic
 *
 * This script controls the core mechanics of the Poopster game. It manages
 * spawning and collecting poops, hiring workers, upgrading tools, unlocking
 * zones, adopting pets, saving/loading progress, daily bonuses and settings.
 *
 * The game uses DOM elements instead of a canvas, which makes it easy to
 * position and animate emoji based entities. Entities are absolutely
 * positioned within the #gameArea element. Workers automatically collect
 * poops over time, while the player can click poops manually to earn coins.
 */

(() => {
  // Game state object
  const gameState = {
    // Give the player a small amount of starting money so they can purchase
    // upgrades straight away without long waiting periods. This makes the
    // opening moments of the game more engaging.
    coins: 20,
    poopCollected: 0,
    scooperLevel: 0,
    spawnLevel: 0,
    workers: [], // array of worker objects
    zoneIndex: 0, // 0: backyard, 1: park, 2: city, 3: beach
    pets: [], // array of pet objects
    settings: {
      sound: true,
      music: true,
      kidMode: false,
    },
  };

  // Zone definitions
  const zones = [
    { name: 'Backyard', cost: 0, bg: ['#d4f4dd', '#c0e8c6'] },
    { name: 'Park', cost: 100, bg: ['#b7e4c7', '#a1d9b3'] },
    { name: 'City', cost: 300, bg: ['#f0f0f0', '#e0e0e0'] },
    { name: 'Beach', cost: 600, bg: ['#f9e79f', '#f7d98b'] },
  ];

  // Upgrade definitions
  const upgrades = [
    {
      id: 'scooper',
      name: 'Better Scooper',
      description: 'Increase coins per poop by 1',
      baseCost: 10,
      levelKey: 'scooperLevel',
      effect: () => {
        // Effect handled in collectPoop() by multiplier
      },
    },
    {
      id: 'spawn',
      name: 'Poop Spawn Rate',
      description: 'More poops appear over time',
      baseCost: 15,
      levelKey: 'spawnLevel',
      effect: () => {
        // spawn rate handled in spawn interval calculation
      },
    },
  ];

  // Worker definition
  const workerCostBase = 50;

  // Pet definitions
  const petDefs = [
    {
      name: 'Happy Dog',
      emoji: '🐶',
      cost: 80,
    },
    {
      name: 'Smiling Poop',
      emoji: '💩',
      cost: 120,
    },
  ];

  // DOM references
  const coinCountEl = document.getElementById('coinCount');
  const poopCountEl = document.getElementById('poopCount');
  const gameArea = document.getElementById('gameArea');
  const upgradeListEl = document.getElementById('upgradeList');
  const workerListEl = document.getElementById('workerList');
  const zoneListEl = document.getElementById('zoneList');
  const petListEl = document.getElementById('petList');
  const tabButtons = document.querySelectorAll('.tab-buttons button');
  const tabs = document.querySelectorAll('.tab');
  const toggleSoundEl = document.getElementById('toggleSound');
  const toggleMusicEl = document.getElementById('toggleMusic');
  const toggleKidModeEl = document.getElementById('toggleKidMode');
  const saveButton = document.getElementById('saveButton');
  const loadButton = document.getElementById('loadButton');
  const dailyBonusPopup = document.getElementById('dailyBonusPopup');
  const collectBonusBtn = document.getElementById('collectBonus');
  const bgMusicEl = document.getElementById('bgMusic');
  const soundPopEl = document.getElementById('soundPop');
  const soundHireEl = document.getElementById('soundHire');

  // Utility to get random position in game area
  function getRandomPosition() {
    const rect = gameArea.getBoundingClientRect();
    // entity size 32x32 approx; offset to avoid edges
    const x = Math.random() * (rect.width - 40);
    const y = Math.random() * (rect.height - 40);
    return { x, y };
  }

  // Update scoreboard display and refresh purchase buttons
  function updateScoreboard() {
    // Display coins and total poops collected
    coinCountEl.textContent = Math.floor(gameState.coins);
    poopCountEl.textContent = gameState.poopCollected;
    // After coin values change, refresh UI elements that depend on coin totals to
    // enable or disable purchase buttons. Without this call the upgrade and
    // hiring buttons may remain disabled even when the player has enough coins.
    refreshUpgradesUI();
    refreshWorkersUI();
    refreshZonesUI();
    refreshPetsUI();
  }

  // Spawn a poop entity
  function spawnPoop() {
    const position = getRandomPosition();
    const poopEl = document.createElement('div');
    poopEl.classList.add('entity', 'poop');
    // If kid mode: use a flower emoji instead of poop emoji to be safer
    poopEl.textContent = gameState.settings.kidMode ? '🌼' : '💩';
    poopEl.style.left = `${position.x}px`;
    poopEl.style.top = `${position.y}px`;
    poopEl.addEventListener('click', () => collectPoop(poopEl));
    gameArea.appendChild(poopEl);
  }

  // Collect a poop manually or by worker
  function collectPoop(poopEl, byWorker = false) {
    if (!poopEl || !poopEl.parentElement) return;
    // Remove poop from DOM
    poopEl.remove();
    // Increase counters
    gameState.poopCollected += 1;
    // Coins gained: base 1 + scooper level
    const gain = 1 + gameState.scooperLevel;
    gameState.coins += gain;
    updateScoreboard();
    // Play sound
    if (gameState.settings.sound && !byWorker) {
      // Play pop sound only for manual collections to avoid overwhelming noise
      soundPopEl.currentTime = 0;
      soundPopEl.play().catch(() => {});
    }
  }

  // Hire a new worker
  function hireWorker() {
    const cost = workerCostBase * Math.pow(1.5, gameState.workers.length);
    if (gameState.coins < cost) return;
    gameState.coins -= cost;
    updateScoreboard();
    // Create worker object
    const worker = {
      id: Date.now() + Math.random(),
      x: 0,
      y: 0,
      element: null,
      target: null,
    };
    // Create DOM element
    const workerEl = document.createElement('div');
    workerEl.classList.add('entity', 'worker');
    workerEl.textContent = '👨‍🌾';
    // Start at random position
    const pos = getRandomPosition();
    worker.x = pos.x;
    worker.y = pos.y;
    workerEl.style.left = `${pos.x}px`;
    workerEl.style.top = `${pos.y}px`;
    gameArea.appendChild(workerEl);
    worker.element = workerEl;
    gameState.workers.push(worker);
    // Play sound for hiring
    if (gameState.settings.sound) {
      soundHireEl.currentTime = 0;
      soundHireEl.play().catch(() => {});
    }
    // UI will refresh via updateScoreboard()
  }

  // Refresh upgrade UI
  function refreshUpgradesUI() {
    upgradeListEl.innerHTML = '';
    upgrades.forEach((upg) => {
      const currentLevel = gameState[upg.levelKey];
      const cost = upg.baseCost * Math.pow(2, currentLevel);
      const item = document.createElement('div');
      item.className = 'upgrade-item';
      const info = document.createElement('span');
      info.textContent = `${upg.name} (Lv ${currentLevel}) – ${upg.description}`;
      const btn = document.createElement('button');
      btn.textContent = `Buy (${cost}₵)`;
      btn.disabled = gameState.coins < cost;
      btn.addEventListener('click', () => {
        if (gameState.coins >= cost) {
          gameState.coins -= cost;
          gameState[upg.levelKey] += 1;
          updateScoreboard();
          // No need to call refreshUpgradesUI here because updateScoreboard
          // triggers all refreshes.
          // If this upgrade affects spawn rate, update it accordingly
          if (upg.id === 'spawn') {
            updateSpawnRate();
          }
        }
      });
      item.appendChild(info);
      item.appendChild(btn);
      upgradeListEl.appendChild(item);
    });
  }

  // Refresh workers UI
  function refreshWorkersUI() {
    workerListEl.innerHTML = '';
    const cost = workerCostBase * Math.pow(1.5, gameState.workers.length);
    const item = document.createElement('div');
    item.className = 'worker-item';
    const info = document.createElement('span');
    info.textContent = `Workers: ${gameState.workers.length}`;
    const btn = document.createElement('button');
    btn.textContent = `Hire (${Math.floor(cost)}₵)`;
    btn.disabled = gameState.coins < cost;
    btn.addEventListener('click', hireWorker);
    item.appendChild(info);
    item.appendChild(btn);
    workerListEl.appendChild(item);
  }

  // Refresh zones UI
  function refreshZonesUI() {
    zoneListEl.innerHTML = '';
    zones.forEach((zone, index) => {
      const item = document.createElement('div');
      item.className = 'zone-item';
      const info = document.createElement('span');
      info.textContent = `${zone.name}`;
      const btn = document.createElement('button');
      if (index <= gameState.zoneIndex) {
        btn.textContent = 'Unlocked';
        btn.disabled = true;
      } else {
        btn.textContent = `Unlock (${zone.cost}₵)`;
        btn.disabled = gameState.coins < zone.cost;
        btn.addEventListener('click', () => {
          if (gameState.coins >= zone.cost) {
            gameState.coins -= zone.cost;
            gameState.zoneIndex = index;
            applyZoneStyles();
            updateScoreboard();
            // updateScoreboard handles refreshZonesUI
          }
        });
      }
      item.appendChild(info);
      item.appendChild(btn);
      zoneListEl.appendChild(item);
    });
  }

  // Apply zone background styles
  function applyZoneStyles() {
    const zone = zones[gameState.zoneIndex];
    const gradient = `linear-gradient(${zone.bg[0]} 0%, ${zone.bg[1]} 100%)`;
    gameArea.style.backgroundImage = gradient;
  }

  // Refresh pets UI
  function refreshPetsUI() {
    petListEl.innerHTML = '';
    petDefs.forEach((petDef) => {
      const count = gameState.pets.filter((p) => p.name === petDef.name).length;
      const item = document.createElement('div');
      item.className = 'pet-item';
      const info = document.createElement('span');
      info.textContent = `${petDef.name} (owned: ${count})`;
      const btn = document.createElement('button');
      btn.textContent = `Adopt (${petDef.cost}₵)`;
      btn.disabled = gameState.coins < petDef.cost;
      btn.addEventListener('click', () => {
        if (gameState.coins >= petDef.cost) {
          gameState.coins -= petDef.cost;
          adoptPet(petDef);
          updateScoreboard();
          // UI will refresh via updateScoreboard()
        }
      });
      item.appendChild(info);
      item.appendChild(btn);
      petListEl.appendChild(item);
    });
  }

  // Adopt a pet
  function adoptPet(petDef) {
    const pet = {
      id: Date.now() + Math.random(),
      name: petDef.name,
      emoji: petDef.emoji,
      x: 0,
      y: 0,
      element: null,
    };
    const petEl = document.createElement('div');
    petEl.classList.add('entity', 'pet');
    petEl.textContent = petDef.emoji;
    // Place at random position
    const pos = getRandomPosition();
    pet.x = pos.x;
    pet.y = pos.y;
    petEl.style.left = `${pos.x}px`;
    petEl.style.top = `${pos.y}px`;
    gameArea.appendChild(petEl);
    pet.element = petEl;
    gameState.pets.push(pet);
    // Pets wander randomly
    setInterval(() => {
      if (!petEl.parentElement) return;
      const newPos = getRandomPosition();
      pet.x = newPos.x;
      pet.y = newPos.y;
      petEl.style.left = `${newPos.x}px`;
      petEl.style.top = `${newPos.y}px`;
    }, 4000 + Math.random() * 3000);
  }

  // Worker autopick routine
  function startWorkerLoop() {
    setInterval(() => {
      // For each worker, attempt to collect a poop
      const poops = Array.from(gameArea.querySelectorAll('.poop'));
      if (poops.length === 0) return;
      gameState.workers.forEach((worker) => {
        if (!poops.length) return;
        const nearest = poops[Math.floor(Math.random() * poops.length)];
        // Move worker visually to poop position (smooth transition)
        const rect = nearest.getBoundingClientRect();
        const areaRect = gameArea.getBoundingClientRect();
        const targetX = rect.left - areaRect.left;
        const targetY = rect.top - areaRect.top;
        worker.x = targetX;
        worker.y = targetY;
        worker.element.style.transition = 'left 0.5s linear, top 0.5s linear';
        worker.element.style.left = `${targetX}px`;
        worker.element.style.top = `${targetY}px`;
        // After movement finishes, collect poop
        setTimeout(() => {
          collectPoop(nearest, true);
        }, 500);
      });
    }, 2500); // interval for workers to act
  }

  // Poop spawn loop
  let spawnIntervalId;
  function updateSpawnRate() {
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    // base spawn interval decreases with spawnLevel and zone
    const baseRate = 3000; // ms
    const rate = baseRate / (1 + gameState.spawnLevel) / (1 + gameState.zoneIndex * 0.5);
    spawnIntervalId = setInterval(() => {
      // limit number of poops to avoid overload
      const currentPoops = gameArea.querySelectorAll('.poop').length;
      const maxPoops = 10 + gameState.zoneIndex * 5;
      if (currentPoops < maxPoops) {
        spawnPoop();
      }
    }, rate);
  }

  // Tab switching
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      // Activate button
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      // Show/hide tabs
      tabs.forEach((tab) => {
        tab.classList.remove('active');
        if (tab.id === `tab-${tabName}`) tab.classList.add('active');
      });
    });
  });

  // Settings toggles
  toggleSoundEl.addEventListener('change', (e) => {
    gameState.settings.sound = e.target.checked;
  });
  toggleMusicEl.addEventListener('change', (e) => {
    gameState.settings.music = e.target.checked;
    if (e.target.checked) {
      bgMusicEl.play().catch(() => {});
    } else {
      bgMusicEl.pause();
    }
  });
  toggleKidModeEl.addEventListener('change', (e) => {
    gameState.settings.kidMode = e.target.checked;
    // Update existing poops appearance
    const poops = document.querySelectorAll('.poop');
    poops.forEach((p) => {
      p.textContent = gameState.settings.kidMode ? '🌼' : '💩';
    });
  });

  // Save/Load handlers
  saveButton.addEventListener('click', () => {
    saveGame();
  });
  loadButton.addEventListener('click', () => {
    loadGame();
  });

  // Daily bonus handlers
  collectBonusBtn.addEventListener('click', () => {
    // Award coins (random between 20 and 50)
    const bonus = Math.floor(20 + Math.random() * 30);
    gameState.coins += bonus;
    updateScoreboard();
    dailyBonusPopup.classList.add('hidden');
  });

  // Save game to localStorage
  function saveGame() {
    const saveData = {
      version: 1,
      coins: gameState.coins,
      poopCollected: gameState.poopCollected,
      scooperLevel: gameState.scooperLevel,
      spawnLevel: gameState.spawnLevel,
      workersCount: gameState.workers.length,
      zoneIndex: gameState.zoneIndex,
      pets: gameState.pets.map((p) => ({ name: p.name, emoji: p.emoji })),
      settings: gameState.settings,
      lastLogin: Date.now(),
    };
    localStorage.setItem('poopsterSave', JSON.stringify(saveData));
    alert('Game saved!');
  }

  // Load game from localStorage
  function loadGame() {
    const data = localStorage.getItem('poopsterSave');
    if (!data) {
      alert('No save found.');
      return;
    }
    try {
      const save = JSON.parse(data);
      if (!save.version || save.version !== 1) throw new Error('Version mismatch');
      gameState.coins = save.coins;
      gameState.poopCollected = save.poopCollected;
      gameState.scooperLevel = save.scooperLevel;
      gameState.spawnLevel = save.spawnLevel;
      // Remove existing workers and pets from DOM
      gameState.workers.forEach((w) => w.element.remove());
      gameState.workers = [];
      gameState.pets.forEach((p) => p.element.remove());
      gameState.pets = [];
      // Recreate workers
      for (let i = 0; i < save.workersCount; i++) {
        hireWorker();
      }
      gameState.zoneIndex = save.zoneIndex;
      applyZoneStyles();
      // Recreate pets
      save.pets.forEach((petDef) => {
        adoptPet(petDef);
      });
      gameState.settings = Object.assign({}, gameState.settings, save.settings);
      toggleSoundEl.checked = gameState.settings.sound;
      toggleMusicEl.checked = gameState.settings.music;
      toggleKidModeEl.checked = gameState.settings.kidMode;
      if (gameState.settings.music) {
        bgMusicEl.play().catch(() => {});
      } else {
        bgMusicEl.pause();
      }
      updateScoreboard();
      refreshUpgradesUI();
      refreshWorkersUI();
      refreshZonesUI();
      refreshPetsUI();
      updateSpawnRate();
      alert('Game loaded!');
    } catch (err) {
      console.error(err);
      alert('Failed to load save.');
    }
  }

  // Check for daily bonus
  function checkDailyBonus() {
    const data = localStorage.getItem('poopsterSave');
    const now = Date.now();
    let lastLogin = 0;
    if (data) {
      try {
        const save = JSON.parse(data);
        lastLogin = save.lastLogin || 0;
      } catch (e) {
        lastLogin = 0;
      }
    }
    const oneDay = 1000 * 60 * 60 * 24;
    if (now - lastLogin > oneDay) {
      // Show daily bonus popup
      dailyBonusPopup.classList.remove('hidden');
    }
  }

  // Initialize game
  function init() {
    updateScoreboard();
    refreshUpgradesUI();
    refreshWorkersUI();
    refreshZonesUI();
    refreshPetsUI();
    applyZoneStyles();
    // Start spawn and worker loops
    updateSpawnRate();
    startWorkerLoop();
    // Start background music if enabled
    if (gameState.settings.music) {
      bgMusicEl.volume = 0.3;
      bgMusicEl.play().catch(() => {});
    }
    // Check daily bonus
    checkDailyBonus();
    // Save lastLogin now
    const data = localStorage.getItem('poopsterSave');
    if (data) {
      try {
        const save = JSON.parse(data);
        save.lastLogin = Date.now();
        localStorage.setItem('poopsterSave', JSON.stringify(save));
      } catch (e) {
        // ignore
      }
    }
  }

  // Kick off
  window.addEventListener('load', init);
})();