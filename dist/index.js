"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    console.log("Dimensional Weight Calculator initialized");
    const form = document.querySelector('[fs-element="form"]');
    const result = document.querySelector('[fs-element="result"]');
    const poundsCheckbox = document.querySelector(".pounds-checkbox");
    const ouncesCheckbox = document.querySelector(".ounces-checkbox");
    if (!form || !result || !poundsCheckbox || !ouncesCheckbox)
      return;
    const parseInputValue = (value) => {
      const parsedValue = parseFloat(value);
      return isNaN(parsedValue) ? null : parsedValue;
    };
    const displayExactActualWeight = (weight, isPounds) => {
      return isPounds ? `${weight} lbs` : `${weight} oz`;
    };
    const convertOuncesToPounds = (ounces) => {
      return ounces / 16;
    };
    const roundUpToNearestPound = (weight) => {
      return Math.ceil(weight);
    };
    const getWeightUnit = () => {
      if (poundsCheckbox.checked) {
        return "lbs";
      }
      if (ouncesCheckbox.checked) {
        return "oz";
      }
      return null;
    };
    const calculateDimensionalWeight = (cubicSize, dimFactor) => {
      return roundUpToNearestPound(cubicSize / dimFactor);
    };
    const calculateUSPSFirstmileBilledWeight = (actualWeight, dimWeight, cubicSize, isPounds) => {
      if (cubicSize > 1728 && actualWeight > (isPounds ? 1 : convertOuncesToPounds(16))) {
        return Math.max(actualWeight, dimWeight);
      }
      return actualWeight;
    };
    const calculateUPSFedExBilledWeight = (actualWeight, dimWeight, isOunces) => {
      if (isOunces) {
        actualWeight = convertOuncesToPounds(actualWeight);
      }
      return roundUpToNearestPound(Math.max(actualWeight, dimWeight));
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const formData = new FormData(form);
      const length = parseInputValue(formData.get("length"));
      const width = parseInputValue(formData.get("width"));
      const height = parseInputValue(formData.get("height"));
      let actualWeightInput = parseInputValue(formData.get("actual-weight"));
      const weightUnit = getWeightUnit();
      if (!weightUnit) {
        result.textContent = "Please select either pounds or ounces for the actual weight.";
        console.log("Error: Invalid weight unit selection. Please choose pounds or ounces.");
        return;
      }
      const isPounds = weightUnit === "lbs";
      const isOunces = weightUnit === "oz";
      if (length === null || width === null || height === null || actualWeightInput === null) {
        result.textContent = "Please provide valid inputs for length, width, height, and actual weight.";
        console.log("Error: Invalid input values.");
        return;
      }
      let displayedWeight = actualWeightInput;
      if (isOunces) {
        displayedWeight = actualWeightInput;
        actualWeightInput = convertOuncesToPounds(actualWeightInput);
      }
      actualWeightInput = roundUpToNearestPound(actualWeightInput);
      if (length < width || length < height) {
        result.textContent = "Error: Length must be greater than or equal to both height and width.";
        console.error(
          "Validation Error: Length must be greater than or equal to both height and width."
        );
        return;
      }
      const cubicSize = length * width * height;
      const dimWeightUPS = calculateDimensionalWeight(cubicSize, 139);
      const dimWeightFedEx = calculateDimensionalWeight(cubicSize, 139);
      const dimWeightUSPS = isOunces ? "N/A" : calculateDimensionalWeight(cubicSize, 166);
      const dimWeightFirstmile = isOunces ? "N/A" : calculateDimensionalWeight(cubicSize, 166);
      const displayedDimWeightUPS = `${dimWeightUPS} lbs`;
      const displayedDimWeightFedEx = `${dimWeightFedEx} lbs`;
      const billedWeightUSPS = calculateUSPSFirstmileBilledWeight(
        actualWeightInput,
        dimWeightUSPS,
        cubicSize,
        isPounds
      );
      const billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(
        actualWeightInput,
        dimWeightFirstmile,
        cubicSize,
        isPounds
      );
      const billedWeightUPS = calculateUPSFedExBilledWeight(
        actualWeightInput,
        dimWeightUPS,
        isOunces
      );
      const billedWeightFedEx = calculateUPSFedExBilledWeight(
        actualWeightInput,
        dimWeightFedEx,
        isOunces
      );
      result.textContent = "Dimensional Weight has been calculated on the table.";
      document.querySelector("#actual-weight-ups").textContent = displayExactActualWeight(
        displayedWeight,
        isPounds
      );
      document.querySelector("#dim-weight-ups").textContent = displayedDimWeightUPS;
      document.querySelector("#billed-weight-ups").textContent = `${billedWeightUPS} lbs`;
      document.querySelector("#actual-weight-fedex").textContent = displayExactActualWeight(
        displayedWeight,
        isPounds
      );
      document.querySelector("#dim-weight-fedex").textContent = displayedDimWeightFedEx;
      document.querySelector("#billed-weight-fedex").textContent = `${billedWeightFedEx} lbs`;
      document.querySelector("#actual-weight-firstmile").textContent = displayExactActualWeight(
        displayedWeight,
        isPounds
      );
      document.querySelector("#dim-weight-firstmile").textContent = isOunces ? "N/A" : `${dimWeightFirstmile} lbs`;
      document.querySelector("#billed-weight-firstmile").textContent = `${billedWeightFirstmile} lbs`;
      document.querySelector("#actual-weight-usps").textContent = displayExactActualWeight(
        displayedWeight,
        isPounds
      );
      document.querySelector("#dim-weight-usps").textContent = isOunces ? "N/A" : `${dimWeightUSPS} lbs`;
      document.querySelector("#billed-weight-usps").textContent = `${billedWeightUSPS} lbs`;
      console.log(`Cubic Size: ${cubicSize}`);
      console.log(`Dimensional Weight (UPS): ${dimWeightUPS} lbs`);
      console.log(`Dimensional Weight (FedEx): ${dimWeightFedEx} lbs`);
      console.log(`Billed Weight (USPS): ${billedWeightUSPS} lbs`);
      console.log(`Billed Weight (Firstmile): ${billedWeightFirstmile} lbs`);
      console.log(`Billed Weight (UPS): ${billedWeightUPS} lbs`);
      console.log(`Billed Weight (FedEx): ${billedWeightFedEx} lbs`);
    });
    const updateDisplay = () => {
      const lengthInput = document.querySelector('input[name="length"]');
      const widthInput = document.querySelector('input[name="width"]');
      const heightInput = document.querySelector('input[name="height"]');
      const actualWeightInput = document.querySelector('input[name="actual-weight"]');
      const lengthDisplay = document.querySelector("#length-display");
      const widthDisplay = document.querySelector("#width-display");
      const heightDisplay = document.querySelector("#height-display");
      const actualWeightDisplay = document.querySelector("#actual-weight-display");
      lengthDisplay.textContent = lengthInput.value || "0";
      widthDisplay.textContent = widthInput.value || "0";
      heightDisplay.textContent = heightInput.value || "0";
      actualWeightDisplay.textContent = actualWeightInput.value || "0";
      const actualWeight = parseInputValue(actualWeightInput.value);
      const weightUnit = getWeightUnit();
      const isPounds = weightUnit === "lbs";
      const isOunces = weightUnit === "oz";
      if (actualWeight !== null) {
        const formattedActualWeight = displayExactActualWeight(actualWeight, isPounds);
        document.querySelector("#actual-weight-ups").textContent = formattedActualWeight;
        document.querySelector("#actual-weight-fedex").textContent = formattedActualWeight;
        document.querySelector("#actual-weight-firstmile").textContent = formattedActualWeight;
        document.querySelector("#actual-weight-usps").textContent = formattedActualWeight;
        if (isPounds) {
          const length = parseInputValue(lengthInput.value);
          const width = parseInputValue(widthInput.value);
          const height = parseInputValue(heightInput.value);
          if (length !== null && width !== null && height !== null) {
            const cubicSize = length * width * height;
            const dimWeightUSPS = calculateDimensionalWeight(cubicSize, 166);
            const billedWeightUSPS = calculateUSPSFirstmileBilledWeight(
              actualWeight,
              dimWeightUSPS,
              cubicSize,
              isPounds
            );
            const billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(
              actualWeight,
              dimWeightUSPS,
              cubicSize,
              isPounds
            );
            document.querySelector("#dim-weight-usps").textContent = `${dimWeightUSPS} lbs`;
            document.querySelector("#dim-weight-firstmile").textContent = `${dimWeightUSPS} lbs`;
            document.querySelector("#billed-weight-usps").textContent = `${billedWeightUSPS} lbs`;
            document.querySelector("#billed-weight-firstmile").textContent = `${billedWeightFirstmile} lbs`;
          }
        }
      }
    };
    document.querySelector('input[name="length"]').addEventListener("input", updateDisplay);
    document.querySelector('input[name="width"]').addEventListener("input", updateDisplay);
    document.querySelector('input[name="height"]').addEventListener("input", updateDisplay);
    document.querySelector('input[name="actual-weight"]').addEventListener("input", updateDisplay);
  });
})();
//# sourceMappingURL=index.js.map
