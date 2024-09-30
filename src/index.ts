// Code Written by Milton Amaya - Firstmile 2024
window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('Dimensional Weight Calculator initialized');

  const form = document.querySelector('[fs-element="form"]');
  const result = document.querySelector('[fs-element="result"]');
  const poundsCheckbox = document.querySelector('.pounds-checkbox'); // using classname
  const ouncesCheckbox = document.querySelector('.ounces-checkbox'); // using classname

  if (!form || !result || !poundsCheckbox || !ouncesCheckbox) return;

  // Function to validate and parse input values
  const parseInputValue = (value) => {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
  };

  // Function to display exact actual weight based on the unit
  const displayExactActualWeight = (weight, isPounds) => {
    return isPounds ? `${weight} lbs` : `${weight} oz`; // Display exact value in lbs or oz
  };

  // Function to convert ounces to pounds
  const convertOuncesToPounds = (ounces) => {
    return ounces / 16;
  };

  // Function to round up to the nearest pound
  const roundUpToNearestPound = (weight) => {
    return Math.ceil(weight);
  };

  // Function to determine if pounds or ounces are selected
  const getWeightUnit = () => {
    if (poundsCheckbox.checked) {
      return 'lbs';
    }
    if (ouncesCheckbox.checked) {
      return 'oz';
    }
    return null;
  };

  // Function to calculate dimensional weight
  const calculateDimensionalWeight = (cubicSize, dimFactor) => {
    return roundUpToNearestPound(cubicSize / dimFactor);
  };

  // Function to calculate USPS/Firstmile billed weight
  const calculateUSPSFirstmileBilledWeight = (actualWeight, dimWeight, cubicSize, isPounds) => {
    // Use the greater of actual weight or dim weight if conditions are met
    if (cubicSize > 1728 && actualWeight > (isPounds ? 1 : convertOuncesToPounds(16))) {
      return Math.max(actualWeight, dimWeight);
    }
    return actualWeight;
  };

  // Function to calculate UPS and FedEx billed weight
  const calculateUPSFedExBilledWeight = (actualWeight, dimWeight, isOunces) => {
    if (isOunces) {
      actualWeight = convertOuncesToPounds(actualWeight); // Convert ounces to pounds for billing
    }
    return roundUpToNearestPound(Math.max(actualWeight, dimWeight)); // Always use the greater value
  };

  // Event listener for form submission
  form.addEventListener('submit', (e) => {
    // Prevent form submission and propagation
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(form);
    const length = parseInputValue(formData.get('length'));
    const width = parseInputValue(formData.get('width'));
    const height = parseInputValue(formData.get('height'));
    let actualWeightInput = parseInputValue(formData.get('actual-weight'));

    // Determine if weight is in pounds or ounces
    const weightUnit = getWeightUnit();

    if (!weightUnit) {
      result.textContent = 'Please select either pounds or ounces for the actual weight.';
      console.log('Error: Invalid weight unit selection. Please choose pounds or ounces.');
      return;
    }

    const isPounds = weightUnit === 'lbs';
    const isOunces = weightUnit === 'oz';

    // Validate input values
    if (length === null || width === null || height === null || actualWeightInput === null) {
      result.textContent =
        'Please provide valid inputs for length, width, height, and actual weight.';
      console.log('Error: Invalid input values.');
      return;
    }

    // Convert ounces to pounds if necessary
    let displayedWeight = actualWeightInput;
    if (isOunces) {
      displayedWeight = actualWeightInput; // Keep the input value as ounces for display purposes
      actualWeightInput = convertOuncesToPounds(actualWeightInput);
    }
    actualWeightInput = roundUpToNearestPound(actualWeightInput);

    // Validation: length must be greater than or equal to both height and width
    if (length < width || length < height) {
      result.textContent = 'Error: Length must be greater than or equal to both height and width.';
      console.error(
        'Validation Error: Length must be greater than or equal to both height and width.'
      );
      return;
    }

    // Calculate cubic size
    const cubicSize = length * width * height;

    // Calculate dimensional weight for each carrier
    const dimWeightUPS = calculateDimensionalWeight(cubicSize, 139);
    const dimWeightFedEx = calculateDimensionalWeight(cubicSize, 139);
    const dimWeightUSPS = isOunces ? 'N/A' : calculateDimensionalWeight(cubicSize, 166); // 'N/A' if ounces selected for FM/USPS
    const dimWeightFirstmile = isOunces ? 'N/A' : calculateDimensionalWeight(cubicSize, 166); // 'N/A' if ounces selected for FM/USPS

    // **NEW: Always calculate Dimensional Weight for UPS and FedEx**
    const displayedDimWeightUPS = `${dimWeightUPS} lbs`; // Show the dim weight for UPS
    const displayedDimWeightFedEx = `${dimWeightFedEx} lbs`; // Show the dim weight for FedEx

    // Calculate billed weight for each carrier
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

    // Output a simple result message
    result.textContent = 'Dimensional Weight has been calculated on the table.';

    // Update the table with the actual weight, dimensional weight, and billed weight for each carrier
    document.querySelector('#actual-weight-ups').textContent = displayExactActualWeight(
      displayedWeight,
      isPounds
    );
    document.querySelector('#dim-weight-ups').textContent = displayedDimWeightUPS; // Always display Dim Weight for UPS
    document.querySelector('#billed-weight-ups').textContent = `${billedWeightUPS} lbs`;

    document.querySelector('#actual-weight-fedex').textContent = displayExactActualWeight(
      displayedWeight,
      isPounds
    );
    document.querySelector('#dim-weight-fedex').textContent = displayedDimWeightFedEx; // Always display Dim Weight for FedEx
    document.querySelector('#billed-weight-fedex').textContent = `${billedWeightFedEx} lbs`;

    document.querySelector('#actual-weight-firstmile').textContent = displayExactActualWeight(
      displayedWeight,
      isPounds
    );
    document.querySelector('#dim-weight-firstmile').textContent = isOunces
      ? 'N/A'
      : `${dimWeightFirstmile} lbs`; // N/A if ounces
    document.querySelector('#billed-weight-firstmile').textContent = `${billedWeightFirstmile} lbs`;

    document.querySelector('#actual-weight-usps').textContent = displayExactActualWeight(
      displayedWeight,
      isPounds
    );
    document.querySelector('#dim-weight-usps').textContent = isOunces
      ? 'N/A'
      : `${dimWeightUSPS} lbs`; // N/A if ounces
    document.querySelector('#billed-weight-usps').textContent = `${billedWeightUSPS} lbs`;

    // Console log outputs for checking
    console.log(`Cubic Size: ${cubicSize}`);
    console.log(`Dimensional Weight (UPS): ${dimWeightUPS} lbs`);
    console.log(`Dimensional Weight (FedEx): ${dimWeightFedEx} lbs`);
    console.log(`Billed Weight (USPS): ${billedWeightUSPS} lbs`);
    console.log(`Billed Weight (Firstmile): ${billedWeightFirstmile} lbs`);
    console.log(`Billed Weight (UPS): ${billedWeightUPS} lbs`);
    console.log(`Billed Weight (FedEx): ${billedWeightFedEx} lbs`);
  });

  // Function to update the display values in real-time
  const updateDisplay = () => {
    const lengthInput = document.querySelector('input[name="length"]');
    const widthInput = document.querySelector('input[name="width"]');
    const heightInput = document.querySelector('input[name="height"]');
    const actualWeightInput = document.querySelector('input[name="actual-weight"]');

    const lengthDisplay = document.querySelector('#length-display');
    const widthDisplay = document.querySelector('#width-display');
    const heightDisplay = document.querySelector('#height-display');
    const actualWeightDisplay = document.querySelector('#actual-weight-display');

    lengthDisplay.textContent = lengthInput.value || '0';
    widthDisplay.textContent = widthInput.value || '0';
    heightDisplay.textContent = heightInput.value || '0';
    actualWeightDisplay.textContent = actualWeightInput.value || '0';

    // Update the actual weight for each carrier in real-time
    const actualWeight = parseInputValue(actualWeightInput.value);
    const weightUnit = getWeightUnit();
    const isPounds = weightUnit === 'lbs';
    const isOunces = weightUnit === 'oz';

    if (actualWeight !== null) {
      const formattedActualWeight = displayExactActualWeight(actualWeight, isPounds);
      document.querySelector('#actual-weight-ups').textContent = formattedActualWeight;
      document.querySelector('#actual-weight-fedex').textContent = formattedActualWeight;
      document.querySelector('#actual-weight-firstmile').textContent = formattedActualWeight;
      document.querySelector('#actual-weight-usps').textContent = formattedActualWeight;

      // Calculate dimensional weight for FM/USPS if pounds are selected
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

          document.querySelector('#dim-weight-usps').textContent = `${dimWeightUSPS} lbs`;
          document.querySelector('#dim-weight-firstmile').textContent = `${dimWeightUSPS} lbs`;

          document.querySelector('#billed-weight-usps').textContent = `${billedWeightUSPS} lbs`;
          document.querySelector('#billed-weight-firstmile').textContent =
            `${billedWeightFirstmile} lbs`;
        }
      }
    }
  };

  // Add event listeners to update the display as the user types
  document.querySelector('input[name="length"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="width"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="height"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="actual-weight"]').addEventListener('input', updateDisplay);
});
