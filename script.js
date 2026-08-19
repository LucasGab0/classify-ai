/* A biblioteca speech-commands exige URL absoluta (http://... completa)
   para o metadata e o modelo — caminho relativo tipo "./metadata.json"
   não é aceito, mesmo rodando num servidor local. Por isso calculamos
   a URL absoluta da pasta atual em tempo de execução. */
const BASE_URL = new URL(".", window.location.href).href;

const CONFIG = {
  // Caminho da pasta onde estão model.json e metadata.json
  // (gerados pelo Teachable Machine, exportação "TensorFlow.js")
  MODEL_URL: BASE_URL + "model.json",
  METADATA_URL: BASE_URL + "metadata.json",

  // Só dispara ação quando a confiança do comando passar disso.
  // Evita ação disparada por ruído / predição instável.
  CONFIDENCE_THRESHOLD: 0.85,

  // Tempo mínimo (ms) entre duas ações disparadas, mesmo que o
  // modelo continue reconhecendo o mesmo comando repetidamente.
  ACTION_COOLDOWN_MS: 1200,

  // Mapeia o nome da classe (exatamente como foi nomeada no
  // Teachable Machine) para uma ação a ser executada.
  // A classe de fundo (ex: "Background Noise") não deve entrar
  // aqui — sem entrada no mapa, nenhuma ação é disparada para ela.
  ACTIONS: {
    Play: (video) => {
      video.play();
      return "Play acionado (comando de voz: Play)";
    },
    Pausar: (video) => {
      video.pause();
      return "Pause acionado (comando de voz: Pausar)";
    },
  },
};

/* ============================================================
   ESTADO
   ============================================================ */
let recognizer;
let lastActionAt = 0;
let lastTriggeredClass = null;

const video = document.getElementById("player");
const predictionsEl = document.getElementById("predictions");
const actionLogEl = document.getElementById("actionLog");
const startBtn = document.getElementById("startBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const micPanel = document.getElementById("micPanel");

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
async function createModel() {
  const checkpointURL = CONFIG.MODEL_URL;
  const metadataURL = CONFIG.METADATA_URL;

  const model = speechCommands.create(
    "BROWSER_FFT",
    undefined,
    checkpointURL,
    metadataURL
  );

  await model.ensureModelLoaded();
  return model;
}

async function init() {
  startBtn.disabled = true;
  statusText.textContent = "carregando modelo...";

  recognizer = await createModel();
  const classLabels = recognizer.wordLabels();

  buildPredictionRows(classLabels);

  statusDot.classList.add("ready");
  statusText.textContent = "ouvindo...";
  startBtn.remove();

  // listen() mantém o microfone escutando continuamente e chama o
  // callback a cada nova janela de áudio analisada pelo modelo.
  recognizer.listen(
    (result) => handleResult(result.scores, classLabels),
    {
      includeSpectrogram: true,
      probabilityThreshold: 0.75, // limiar interno da lib para dar um novo evento
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5,
    }
  );
}

/* Cria uma linha de barra de confiança para cada classe do modelo */
function buildPredictionRows(classLabels) {
  predictionsEl.innerHTML = "";
  classLabels.forEach((label, i) => {
    const row = document.createElement("div");
    row.className = "prediction-row";
    row.innerHTML = `
      <span class="prediction-row__label">${label}</span>
      <span class="prediction-row__bar"><span class="prediction-row__fill" id="fill-${i}"></span></span>
      <span class="prediction-row__value" id="value-${i}">0%</span>
    `;
    predictionsEl.appendChild(row);
  });
}

/* ============================================================
   TRATAMENTO DO RESULTADO
   ============================================================ */
function handleResult(scores, classLabels) {
  let top = { className: null, probability: 0 };

  classLabels.forEach((label, i) => {
    const probability = scores[i];
    const percent = Math.round(probability * 100);

    const fillEl = document.getElementById(`fill-${i}`);
    const valueEl = document.getElementById(`value-${i}`);
    fillEl.style.width = `${percent}%`;
    valueEl.textContent = `${percent}%`;
    fillEl.classList.toggle(
      "above-threshold",
      probability >= CONFIG.CONFIDENCE_THRESHOLD
    );

    if (probability > top.probability) {
      top = { className: label, probability };
    }
  });

  maybeTriggerAction(top.className, top.probability);
}

/* ============================================================
   AÇÃO AUTOMÁTICA
   Aqui é onde a predição vira consequência real no sistema.
   ============================================================ */
function maybeTriggerAction(className, probability) {
  const action = CONFIG.ACTIONS[className];
  if (!action) return; // classe de fundo / sem ação mapeada não faz nada

  if (probability < CONFIG.CONFIDENCE_THRESHOLD) return;

  const now = Date.now();
  const sameClassAsBefore = className === lastTriggeredClass;
  const withinCooldown = now - lastActionAt < CONFIG.ACTION_COOLDOWN_MS;

  // Evita repetir a mesma ação em loop enquanto o comando continua
  // sendo reconhecido, mas ainda permite trocar de ação rapidamente
  // se o usuário disser outro comando.
  if (sameClassAsBefore && withinCooldown) return;

  const message = action(video);

  lastActionAt = now;
  lastTriggeredClass = className;
  actionLogEl.textContent = `${message} · ${new Date().toLocaleTimeString()}`;
}

/* ============================================================
   START
   ============================================================ */
startBtn.addEventListener("click", init);
