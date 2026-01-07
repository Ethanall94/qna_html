let allWords = [];
let words = [];
let current, answer;
let wrong = [];
let locked = false;
let totalCount = 0;
let currentIndex = 0;

// JSON 파일 업로드
document.getElementById("fileInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      allWords = JSON.parse(reader.result);
      words = [...allWords];
      totalCount = allWords.length;
      currentIndex = 0;
      nextQuestion();
    } catch {
      alert("올바른 단어장 JSON 파일이 아닙니다.");
    }
  };
  reader.readAsText(file);
});

function speak(text) {
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function nextQuestion() {
  locked = false;

  if (words.length === 0) {
    showResult();
    return;
  }

  currentIndex++;
  updateProgress();

  current = words.splice(Math.floor(Math.random() * words.length), 1)[0];
  document.getElementById("word").textContent = current.word;
  speak(current.word);

  answer = current.meanings[Math.floor(Math.random() * current.meanings.length)];
  const allMeanings = allWords.flatMap(w => w.meanings);

  let choices = [answer];
  while (choices.length < 4) {
    const c = allMeanings[Math.floor(Math.random() * allMeanings.length)];
    if (!choices.includes(c)) choices.push(c);
  }
  choices.sort(() => Math.random() - 0.5);

  document.querySelectorAll("#choices button").forEach((btn, i) => {
    btn.textContent = choices[i];
    btn.className = "choice";
    btn.disabled = false;
    btn.onclick = () => checkAnswer(btn);
  });
}

function checkAnswer(btn) {
  if (locked) return;
  locked = true;

  document.querySelectorAll("#choices button").forEach(b => {
    b.disabled = true;
    if (b.textContent === answer) b.classList.add("correct");
  });

  if (btn.textContent !== answer) {
    btn.classList.add("wrong");
    wrong.push(current);
  }

  setTimeout(nextQuestion, 600);
}

function showResult() {
  document.getElementById("progress-bar").style.width = "100%";
  document.body.innerHTML = `
    <h2>오답 노트</h2>
    ${wrong.map(w => `<p>${w.word} : ${w.meanings.join(", ")}</p>`).join("")}
    <br>
    <p>총 ${totalCount}문제 중 ${totalCount - wrong.length}개 정답</p>
  `;
}

function updateProgress() {
  const percent = (currentIndex / totalCount) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").textContent = `${currentIndex} / ${totalCount}`;
}