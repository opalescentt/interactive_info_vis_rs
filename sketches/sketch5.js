// Instance-mode sketch for tab 2
registerSketch("sk5", function (p) {
  // normalize country -> filename key (lowercase, non-alnum -> underscore)
  function normalizeName(name) {
    if (!name) return "";
    return String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  const bottles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    country: "",
    mm: 0,
  }));

  // data
  let average;
  let twenty;
  let twentyone;
  let twentytwo;
  let twentythree;
  let twentyfour;
  let yearTables;

  // Layout
  const cols = 5;
  const rows = 2;
  const margin = 40;
  const topPad = 120;
  const bottomPad = 110;

  let yearSlider;
  const yearLabels = ["Average", "2020", "2021", "2022", "2023", "2024"];

  function drawBottles(table) {
    const countries = table.getColumn("country");
    const precip = table.getColumn("precipitation");
    for (let i = 0; i < bottles.length; i++) {
      setBottle(i, Number(precip[i]), countries[i]);
    }
  }

  p.preload = function () {
    average = p.loadTable("./assets/avg_sea_precip.csv", "csv", "header");
    twenty = p.loadTable("./assets/2020_sea_precip.csv", "csv", "header");
    twentyone = p.loadTable("./assets/2021_sea_precip.csv", "csv", "header");
    twentytwo = p.loadTable("./assets/2022_sea_precip.csv", "csv", "header");
    twentythree = p.loadTable("./assets/2023_sea_precip.csv", "csv", "header");
    twentyfour = p.loadTable("./assets/2024_sea_precip.csv", "csv", "header");
    yearTables = [
      average,
      twenty,
      twentyone,
      twentytwo,
      twentythree,
      twentyfour,
    ];
  };

  p.setup = function () {
    const cnv = p.createCanvas(800, 900);
    p.textFont("sans-serif");
    p.noLoop();
    drawBottles(average);

    // Slider (discrete steps: 0..5)
    yearSlider = p.createSlider(0, yearLabels.length - 1, 0, 1);
    yearSlider.parent(cnv.parent());
    const sliderW = p.width - margin * 2;
    yearSlider.style("width", `${sliderW}px`);
    yearSlider.style("display", "block");
    yearSlider.style("margin", `12px 0 0 ${margin}px`);
    yearSlider.input(() => {
      const value = yearSlider.value();
      const table = yearTables[value];
      drawBottles(table);
      p.redraw();
    });

    p.redraw();
  };

  p.draw = function () {
    p.background(245);
    p.textSize(32);
    p.fill(0);
    p.text("Where does it rain the most in South East Asia?", 55, 50);
    p.textSize(20);
    p.text(
      "On average, Indonesia recieves the highest mm of rainfall each year. Use the slider to explore how these numbers have changed over the years.",
      55,
      70,
      700
    );
    p.textSize(15);
    p.text("Each bottle holds 4000mm of water.", 55, 130, 700);

    const max_precipitation = 4000;
    const gridW = p.width - margin * 2;
    const gridH = p.height - bottomPad - (margin + topPad);
    const baseX = margin;
    const baseY = margin + topPad;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    const selIdx = yearSlider ? yearSlider.value() : 0;

    for (let idx = 0; idx < bottles.length; idx++) {
      const b = bottles[idx];
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const cellX = baseX + col * cellW;
      const cellY = baseY + row * cellH;

      const bottleW = cellW * 0.9;
      const bottleH = cellH * 0.8;

      const cx = cellX + cellW / 2;
      const cy = cellY + cellH / 2;

      const ratio = p.constrain(b.mm / max_precipitation, 0, 1);
      drawBottle(cx, cy, bottleW, bottleH, ratio, b);

      // country and mm text under bottle
      p.push();
      p.textAlign(p.CENTER, p.TOP);
      p.fill(30);
      p.noStroke();
      p.textSize(12);

      const textY = cy + bottleH / 2 + 8;
      const countryText = b.country || "";
      const mmText = typeof b.mm === "number" ? `${Math.round(b.mm)} mm` : "";

      p.text(countryText, cx, textY);
      p.text(mmText, cx, textY + 14);
      p.pop();
    }

    drawYearLabels(selIdx);
  };

  function drawBottle(cx, cy, w, h, fillRatio, b) {
    const bodyW = w * 0.75;
    const neckW = bodyW * 0.4;
    const capH = h * 0.06;
    const neckH = h * 0.12;
    const bodyH = h - neckH - capH;
    const yTop = cy - h / 2;
    const bodyX = cx - bodyW / 2;
    const bodyY = yTop + capH + neckH;
    const cornerR = 18;

    // Cap
    p.noStroke();
    p.fill(30, 120, 200);
    p.rectMode(p.CORNER);
    p.rect(cx - neckW / 2, yTop, neckW, capH, 6, 6, 2, 2);

    // Neck
    p.fill(220);
    p.rect(cx - neckW / 2, yTop + capH, neckW, neckH);

    // Water
    const waterH = bodyH * p.constrain(fillRatio, 0, 1);
    const waterY = bodyY + bodyH - waterH;
    if (waterH > 0) {
      p.noStroke();
      p.fill(70, 150, 220, 220);
      p.rect(bodyX, waterY, bodyW, waterH, 0, 0, cornerR, cornerR);
    }

    // Outline
    p.noFill();
    p.stroke(50);
    p.strokeWeight(2);
    p.rect(bodyX, bodyY, bodyW, bodyH, cornerR);

    // Label band
    const bandH = bodyH * 0.34;
    const bandY = bodyY + bodyH * 0.45 - bandH / 2;
    p.fill(255, 170);
    p.stroke(140, 180);
    p.strokeWeight(1.5);
    p.rect(bodyX, bandY, bodyW, bandH);

    // Edge shading
    p.noStroke();
    p.fill(0, 0, 0, 20);
    p.rect(bodyX, bandY, 6, bandH);
    p.rect(bodyX + bodyW - 6, bandY, 6, bandH);
  }

  function drawYearLabels(selIdx) {
    p.push(); // save styles
    const y = p.height - 24;
    const left = margin;
    const right = p.width - margin;
    const span = right - left;

    p.textAlign(p.CENTER, p.CENTER);
    for (let i = 0; i < yearLabels.length; i++) {
      const t = yearLabels.length === 1 ? 0.5 : i / (yearLabels.length - 1);
      const x = left + t * span;
      p.fill(i === selIdx ? 20 : 90);
      p.textSize(i === selIdx ? 14 : 12);
      p.text(yearLabels[i], x, y);
    }
    p.pop(); // restore previous textAlign (and other styles)
  }

  function setBottle(index, mm, country) {
    if (index < 0 || index >= bottles.length) return;
    if (typeof mm === "number") bottles[index].mm = mm;
    if (country !== undefined) bottles[index].country = country;
  }

  p.redraw();

  p.windowResized = function () {
    p.resizeCanvas(800, 900);
    if (yearSlider) {
      const sliderW = p.width - margin * 2;
      yearSlider.style("width", `${sliderW}px`);
      yearSlider.style("margin", `12px 0 0 ${margin}px`);
    }
    p.redraw();
  };
});
