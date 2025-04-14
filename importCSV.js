require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createClient } = require("@supabase/supabase-js");
const pLimit = require("p-limit");
const cliProgress = require("cli-progress");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = path.join(__dirname, "data.csv");
const limit = pLimit(100);

function countLines(filePath) {
  return new Promise((resolve) => {
    let count = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", () => count++)
      .on("end", () => resolve(count));
  });
}

async function insertRow(row) {
  const formattedRow = {
    date: row["DATA (YYYY-MM-DD)"],
    time: row["Hora UTC"],
    rain_max: parseFloat(
      row["PRECIPITAÇÃO TOTAL, HORÁRIO (mm)"].replace(",", ".")
    ),
    rad_max: parseFloat(row["RADIACAO GLOBAL (KJ/m²)"].replace(",", ".")),
    temp_avg: parseFloat(
      row["TEMPERATURA DO AR - BULBO SECO, HORARIA (°C)"].replace(",", ".")
    ),
    temp_max: parseFloat(
      row["TEMPERATURA MÁXIMA NA HORA ANT. (AUT) (°C)"].replace(",", ".")
    ),
    temp_min: parseFloat(
      row["TEMPERATURA MÍNIMA NA HORA ANT. (AUT) (°C)"].replace(",", ".")
    ),
    hum_avg: parseFloat(
      row["UMIDADE RELATIVA DO AR, HORARIA (%)"].replace(",", ".")
    ),
    hum_max: parseFloat(
      row["UMIDADE REL. MAX. NA HORA ANT. (AUT) (%)"].replace(",", ".")
    ),
    hum_min: parseFloat(
      row["UMIDADE REL. MIN. NA HORA ANT. (AUT) (%)"].replace(",", ".")
    ),
    wind_max: parseFloat(row["VENTO, RAJADA MAXIMA (m/s)"].replace(",", ".")),
    wind_avg: parseFloat(
      row["VENTO, VELOCIDADE HORARIA (m/s)"].replace(",", ".")
    ),
    station_code: row["ESTACAO"],
  };

  try {
    const { error } = await supabase
      .from("weather_data")
      .upsert([formattedRow], { onConflict: ["station_code", "date", "time"] });

    if (error) {
      console.error("Erro ao inserir linha:", error.message);
    }
  } catch (err) {
    console.error("Erro inesperado:", err);
  }
}

async function processCSV() {
  const total = await countLines(filePath);
  const bar = new cliProgress.SingleBar(
    {
      format:
        "Progresso |{bar}| {percentage}% || {value}/{total} linhas || {speed} linhas/s || ETA: {eta_formatted}",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  let current = 0;
  let startTime = Date.now();

  bar.start(total, 0, { speed: "0", eta_formatted: "--:--" });

  const tasks = [];

  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const task = limit(async () => {
          await insertRow(row);
          current++;

          const elapsed = (Date.now() - startTime) / 1000;
          const speed = (current / elapsed).toFixed(2);
          const eta = ((total - current) / speed).toFixed(0);

          bar.update(current, {
            speed,
            eta_formatted: formatSeconds(eta),
          });
        });
        tasks.push(task);
      })
      .on("end", async () => {
        await Promise.all(tasks);
        bar.stop();
        console.log("✅ Importação finalizada com sucesso!");
        resolve();
      });
  });
}

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function init() {
  return processCSV();
}

if (require.main === module) {
  init();
}

module.exports = {
  countLines,
  insertRow,
  formatSeconds,
  processCSV,
  init,
};
