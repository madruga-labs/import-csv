jest.mock("fs", () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation(function (event, callback) {
      if (event === "end") {
        setTimeout(callback, 0);
      }
      return this;
    }),
  }),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

jest.mock("csv-parser", () => jest.fn().mockReturnValue({}));
jest.mock("path", () => ({ join: jest.fn().mockReturnValue("mocked-path") }));
jest.mock("dotenv", () => ({ config: jest.fn() }));

jest.mock("cli-progress", () => ({
  SingleBar: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    update: jest.fn(),
    stop: jest.fn(),
  })),
  Presets: {
    shades_classic: {},
  },
}));

jest.mock("p-limit", () => {
  return jest.fn().mockImplementation(() => {
    return jest.fn((fn) => fn());
  });
});

let consoleLogSpy;
let consoleErrorSpy;

describe("Importador CSV", () => {
  let formatSeconds;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    formatSeconds = require("./importCSV").formatSeconds;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("formatSeconds formata segundos corretamente", () => {
    expect(formatSeconds(65)).toBe("01:05");
    expect(formatSeconds(120)).toBe("02:00");
    expect(formatSeconds(0)).toBe("00:00");
  });
});
