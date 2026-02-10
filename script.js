function selectMood() {
  document.getElementById("choice").classList.remove("hidden");
}

function showComfort() {
  const msgs = [
    "It’s okay to move slowly today.",
    "You don’t need to fix everything.",
    "Rest is not quitting."
  ];
  showMessage(msgs);
}

function showEngage() {
  const msgs = [
    "One small win is enough.",
    "Use this energy gently.",
    "Do something kind for future you."
  ];
  showMessage(msgs);
}

function showMessage(arr) {
  const msg = arr[Math.floor(Math.random() * arr.length)];
  document.getElementById("result").innerText = msg;
}
