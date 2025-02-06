/* 
  Struktur Data:
  - players: Array pemain yang didaftarkan.
  - roleDistribution: Menentukan jumlah masing-masing peran dan skill yang terkait.
*/

let players = [];  // Akan diisi melalui registrasi
const roleDistribution = [
  { role: "Bos-Lana!!🧛🏻🧛🏻‍♀️", count: 1, skill: "Killed", skillClass: "skill-mafia" },
  { role: "Force!!🧛🏻‍♂️🧛🏻‍♀️", count: 1, skill: "Exchange Vote", skillClass: "skill-mafia" },
  { role: "Killer! 🔪🩸", count: 3, skill: "Killed", skillClass: "skill-killer" },
  { role: "Dokter~🔱🛡️", count: 1, skill: "Heal", skillClass: "skill-dokter" },
  { role: "Polisi°🕵🚔", count: 1, skill: "Investigate", skillClass: "skill-polisi" },
  { role: "Hunter®🏹⚔️", count: 1, skill: "Kill Mafia", skillClass: "skill-hunter" },
  { role: "OverLord•🔮💎", count: 1, skill: "Summon / Investigate / Killed / Exchange Vote", skillClass: "skill-overlord" },
  { role: "Joker🎭🏵️", count: 1, skill: "", skillClass: "skill-none" },
  { role: "Warga👥", count: 25, skill: "", skillClass: "skill-none" }
];

let gameStarted = false;
let currentDay = 1;

// ------------------ Navigasi Halaman ------------------
function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

// ------------------ Halaman Registrasi ------------------
function registerPlayer() {
  const input = document.getElementById("player-name");
  const name = input.value.trim();
  if (name && players.length < 35) {
    players.push({ name: name, role: null, skill: null, skillUsed: false, alive: true, vote: 0 });
    input.value = "";
    document.getElementById("player-count").innerText = `Pemain terdaftar: ${players.length}/35`;
    if (players.length === 35) {
      document.getElementById("btn-start-game").disabled = false;
    }
    saveGameState();
  }
}

// ------------------ Mulai Game & Pembagian Peran ------------------
function startGame() {
  if (players.length < 35) {
    alert("Jumlah pemain belum mencapai 35!");
    return;
  }
  assignRoles();
  gameStarted = true;
  saveGameState();
  goToPage("page-home");
  renderHome();
  startVotingTimer();
  startSkillTimer();
  startWinConditionChecker();
}

function assignRoles() {
  let availableRoles = [];
  roleDistribution.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      availableRoles.push({ role: item.role, skill: item.skill, skillClass: item.skillClass });
    }
  });
  availableRoles = shuffle(availableRoles);
  players.forEach((player, i) => {
    player.role = availableRoles[i].role;
    player.skill = availableRoles[i].skill;
    player.skillClass = availableRoles[i].skillClass;
  });
  saveGameState();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ------------------ Halaman Home ------------------
function renderHome() {
  // Tampilkan Day
  document.getElementById("day-display").innerText = `Day-${currentDay}`;
  // Render grid pemain di Home
  const container = document.getElementById("player-info");
  container.innerHTML = "";
  players.forEach(player => {
    const box = document.createElement("div");
    box.classList.add("player-box");
    if (!player.alive) box.classList.add("eliminated");
    box.innerHTML = `<div class="name">${player.name}</div>
                     <div class="role">${player.role}</div>
                     <div class="skill ${player.skillClass}">${player.skill || ""}</div>`;
    // Jika pemain memiliki skill yang bisa digunakan (misal, dokter, mafia, dll)
    // dan belum digunakan hari ini, maka klik kotak akan membawa ke halaman Skill
    box.onclick = () => {
      if (player.alive && player.skill && !player.skillUsed) {
        window.currentSkillUser = player;
        goToPage("page-skill");
        renderSkillGrid();
      }
    };
    container.appendChild(box);
  });
  saveGameState();
}

// ------------------ Halaman Skill ------------------
function renderSkillGrid() {
  const grid = document.getElementById("skill-grid");
  grid.innerHTML = "";
  // Tampilkan semua pemain di grid 5x7
  players.forEach(target => {
    const box = document.createElement("div");
    box.classList.add("player-box");
    if (!target.alive) box.classList.add("eliminated");
    box.innerHTML = `<div>${target.name}</div>`;
    // Pilih target untuk menggunakan skill
    box.onclick = () => {
      applySkill(window.currentSkillUser, target);
      window.currentSkillUser.skillUsed = true;
      saveGameState();
      goToPage("page-home");
      renderHome();
    };
    grid.appendChild(box);
  });
}

// Contoh fungsi applySkill
function applySkill(user, target) {
  // Logika sederhana:
  // - Jika user adalah Dokter, target diselamatkan (misal, jika target tereliminasi, hidupkan kembali)
  // - Jika user adalah Mafia atau Killer, target dieliminasi.
  // - Jika user adalah Force, lakukan pertukaran vote (contoh sederhana).
  // - Jika user adalah Polisi, buka peran target (misal, tampilkan alert)
  // - Jika user adalah Hunter, jika target berperan Mafia, target dieliminasi.
  // - Jika user adalah OverLord, opsi khusus bisa dikembangkan.
  if (user.role.toLowerCase().includes("dokter")) {
    target.alive = true;
    alert(`${user.name} (Dokter) menyelamatkan ${target.name}`);
  } else if (user.role.toLowerCase().includes("mafia") || user.role.toLowerCase().includes("killer")) {
    target.alive = false;
    alert(`${user.name} membunuh ${target.name}`);
  } else if (user.role.toLowerCase().includes("force")) {
    alert(`${user.name} menukar vote dengan ${target.name}`);
    // Logika pertukaran vote dapat ditambahkan
  } else if (user.role.toLowerCase().includes("polisi")) {
    alert(`${user.name} membuka peran ${target.name}: ${target.role}`);
  } else if (user.role.toLowerCase().includes("hunter")) {
    if (target.role.toLowerCase().includes("mafia")) {
      target.alive = false;
      alert(`${user.name} membunuh mafia ${target.name}`);
    } else {
      alert(`${user.name} gagal, ${target.name} bukan mafia`);
    }
  } else if (user.role.toLowerCase().includes("overlord")) {
    alert(`${user.name} memilih skill untuk ${target.name}`);
    // Untuk OverLord, logika khusus 4 opsi dapat dikembangkan.
  }
  saveGameState();
}

// ------------------ Halaman Room Voting ------------------
function renderVotingGrid() {
  const grid = document.getElementById("voting-grid");
  grid.innerHTML = "";
  players.forEach(player => {
    const box = document.createElement("div");
    box.classList.add("player-box");
    if (!player.alive) {
      box.classList.add("eliminated");
      box.innerHTML = `<div>${player.name}</div><div>${player.role}</div>`;
    } else {
      box.innerHTML = `<div>${player.name}</div>`;
    }
    // Klik untuk memilih target vote
    box.onclick = () => {
      players.forEach(p => p.vote = false);
      player.vote = true;
      document.querySelectorAll("#voting-grid .player-box").forEach(el => el.classList.remove("selected"));
      box.classList.add("selected");
      saveGameState();
    };
    grid.appendChild(box);
  });
}

function submitVote() {
  let voted = players.find(p => p.vote === true);
  if (voted) {
    voted.alive = false;
    alert(`${voted.name} telah dieliminasi karena mendapatkan vote terbanyak.`);
  } else {
    alert("Belum ada vote yang dipilih.");
  }
  saveGameState();
  goToPage("page-home");
  renderHome();
}

// ------------------ Timer & Reminder ------------------
function startVotingTimer() {
  let votingTime = 10 * 60; // 10 menit (contoh)
  votingInterval = setInterval(() => {
    votingTime--;
    if (votingTime === 5 * 60) {
      alert("Peringatan: 5 menit lagi untuk voting!");
    }
    if (votingTime <= 0) {
      clearInterval(votingInterval);
      alert("Voting ditutup otomatis.");
      submitVote();
    }
  }, 1000);
}

function startSkillTimer() {
  let skillTime = 10 * 60; // 10 menit (contoh)
  skillInterval = setInterval(() => {
    skillTime--;
    if (skillTime === 5 * 60) {
      alert("Peringatan: 5 menit lagi untuk penggunaan skill!");
    }
    if (skillTime <= 0) {
      clearInterval(skillInterval);
      alert("Waktu penggunaan skill telah habis. Skill yang belum digunakan akan direset.");
      players.forEach(p => p.skillUsed = false);
      saveGameState();
    }
  }, 1000);
}

// ------------------ Win Condition Checker ------------------
function startWinConditionChecker() {
  setInterval(() => {
    let mafiaAlive = players.filter(p => p.alive && p.role.toLowerCase().includes("mafia")).length;
    let jokerAlive = players.filter(p => p.alive && p.role.toLowerCase().includes("joker")).length;
    let citizenAlive = players.filter(p => p.alive && !p.role.toLowerCase().includes("mafia") && !p.role.toLowerCase().includes("joker")).length;
    // Contoh kondisi kemenangan:
    if (jokerAlive && getHighestVote() === "joker") {
      alert("Joker menang!");
      endGame();
    } else if (mafiaAlive === 0) {
      alert("Citizen menang!");
      endGame();
    } else if (mafiaAlive >= citizenAlive) {
      alert("Mafia menang!");
      endGame();
    }
  }, 5000);
}

function getHighestVote() {
  // Dummy: logika vote sebenarnya perlu diimplementasikan
  return "";
}

function endGame() {
  clearInterval(votingInterval);
  clearInterval(skillInterval);
  alert("Permainan berakhir.");
  // Reset game atau arahkan ke halaman hasil akhir
}

// ------------------ LocalStorage ------------------
function saveGameState() {
  localStorage.setItem("players", JSON.stringify(players));
  localStorage.setItem("currentDay", currentDay);
}

function loadGameState() {
  let savedPlayers = localStorage.getItem("players");
  let savedDay = localStorage.getItem("currentDay");
  if (savedPlayers) players = JSON.parse(savedPlayers);
  if (savedDay) currentDay = parseInt(savedDay);
}

// ------------------ Navigasi Halaman ------------------
function renderVotingPage() {
  goToPage("page-room-voting");
  renderVotingGrid();
}

document.getElementById("btn-room-voting").onclick = function() {
  renderVotingPage();
};

// ------------------ Inisialisasi Halaman ------------------
window.onload = function() {
  loadGameState();
  // Jika jumlah pemain kurang dari 35, tampilkan halaman registrasi
  if (players.length < 35) {
    goToPage("page-register");
    document.getElementById("player-count").innerText = `Pemain terdaftar: ${players.length}/35`;
  } else {
    goToPage("page-home");
    renderHome();
    startVotingTimer();
    startSkillTimer();
    startWinConditionChecker();
  }
};