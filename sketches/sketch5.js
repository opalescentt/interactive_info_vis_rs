// Instance-mode sketch for tab 2
registerSketch("sk5", function (p) {
  // used copilot for drawing and ratio prep, going to set up logic myself

  // Data model for 10 bottles
  // mm: precipitation in millimeters (per year)
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

  // Layout
  const cols = 5;
  const rows = 2;
  const margin = 40; // outer side/bottom margin
  const topPad = 120; // extra space at the top for a future title/intro
  const bottomPad = 110;
  const gutter = 20; // spacing inside cells

  let yearSlider;
  const yearLabels = ["Average", "2020", "2021", "2022", "2023", "2024"];

  function drawBottles(table) {
    country = table.getColumn("country");
    precip = table.getColumn("precipitation");
    console.log(country);
    console.log(precip);

    for (let i = 0; i < country.length; i++) {
      setBottle(i, Number(precip[i]), country[i]);
    }
  }

  p.preload = function () {
    average = p.loadTable("/assets/avg_sea_precip.csv", "csv", "header");
    twenty = p.loadTable("/assets/2020_sea_precip.csv", "csv", "header");
    twentyone = p.loadTable("/assets/2021_sea_precip.csv", "csv", "header");
    twentytwo = p.loadTable("/assets/2022_sea_precip.csv", "csv", "header");
    twentythree = p.loadTable("/assets/2023_sea_precip.csv", "csv", "header");
    twentyfour = p.loadTable("/assets/2024_sea_precip.csv", "csv", "header");
  };

  p.setup = function () {
    const cnv = p.createCanvas(800, 900);
    p.textFont("sans-serif");
    p.noLoop();

    avgCountry = average.getColumn("country");
    avgPrecip = average.getColumn("precipitation");

    drawBottles(average);

    // Slider (discrete steps: 0..5)
    yearSlider = p.createSlider(0, yearLabels.length - 1, 0, 1);
    // Place under the canvas, align with the drawing margins, and match inner width
    yearSlider.parent(cnv.parent());
    const sliderW = p.width - margin * 2; // same width as the grid area
    yearSlider.style("width", `${sliderW}px`);
    yearSlider.style("display", "block");
    yearSlider.style("margin", `12px 0 0 ${margin}px`); // top, right, bottom, left
    yearSlider.input(() => p.redraw());

    p.redraw();
  };

  p.draw = function () {
    p.background(245);
    let max_precipitation = 4000; // each bottle holds 4000 mm of water

    // Compute grid cell sizes (leave extra space at top)
    const gridW = p.width - margin * 2;
    const gridH = p.height - bottomPad - (margin + topPad);
    const baseX = margin;
    const baseY = margin + topPad;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    // Selected year key
    const selIdx = yearSlider ? yearSlider.value() : 0;
    const selKey = yearLabels[selIdx];

    // Draw bottles
    for (let idx = 0; idx < bottles.length; idx++) {
      const b = bottles[idx];
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const cellX = baseX + col * cellW;
      const cellY = baseY + row * cellH;

      // Bottle size within cell — wider and shorter
      const bottleW = cellW * 0.9;
      const bottleH = cellH * 0.8;

      const cx = cellX + cellW / 2;
      const cy = cellY + cellH / 2;

      // Draw a bottle at center of the cell
      const ratio = p.constrain(b.mm / max_precipitation, 0, 1);
      drawBottle(cx, cy, bottleW, bottleH, ratio);
    }

    // Draw slider labels under the slider area (aligned across the canvas)
    drawYearLabels(selIdx);
  };

  function drawBottle(cx, cy, w, h, fillRatio) {
    // Bottle
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

    // WATER: full bottle width, sits under the outline
    const waterH = bodyH * p.constrain(fillRatio, 0, 1);
    const waterY = bodyY + bodyH - waterH;
    if (waterH > 0) {
      p.noStroke();
      p.fill(70, 150, 220, 220);
      p.rect(bodyX, waterY, bodyW, waterH, 0, 0, cornerR, cornerR);
    }

    // OUTLINE: stroke only (no fill) so water shows edge-to-edge
    p.noFill();
    p.stroke(50);
    p.strokeWeight(2);
    p.rect(bodyX, bodyY, bodyW, bodyH, cornerR);

    // LABEL: translucent wrap band, full width, square corners (no rounding)
    const bandH = bodyH * 0.34;
    const bandY = bodyY + bodyH * 0.45 - bandH / 2;
    p.fill(255, 170); // translucent white
    p.stroke(140, 180); // soft edge
    p.strokeWeight(1.5);
    p.rect(bodyX, bandY, bodyW, bandH); // square corners

    // Subtle edge shading to suggest wrap (optional)
    p.noStroke();
    p.fill(0, 0, 0, 20);
    p.rect(bodyX, bandY, 6, bandH); // left shade
    p.rect(bodyX + bodyW - 6, bandY, 6, bandH); // right shade
  }

  function drawYearLabels(selIdx) {
    const y = p.height - 24; // near bottom
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
  }

  // Update a single bottle now (e.g., from UI or code)
  function setBottle(index, mm, country) {
    if (index < 0 || index >= bottles.length) return;
    if (typeof mm === "number") bottles[index].mm = mm;
    if (country !== undefined) bottles[index].country = country;
  }
  p.redraw();

  p.windowResized = function () {
    p.resizeCanvas(800, 900);
    // Keep the slider width/offset in sync if canvas changes
    if (yearSlider) {
      const sliderW = p.width - margin * 2;
      yearSlider.style("width", `${sliderW}px`);
      yearSlider.style("margin", `12px 0 0 ${margin}px`);
    }
    p.redraw();
  };
});
