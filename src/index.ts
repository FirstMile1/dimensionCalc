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

  // Function to format actual weight (display in pounds or ounces)
  const formatActualWeight = (weight, isPounds) => {
    return isPounds ? `${Math.round(weight)} lbs` : `${Math.round(weight)} oz`;
  };

  // Function to convert ounces to pounds
  const convertOuncesToPounds = (ounces) => {
    return ounces / 16;
  };

  // Function to round UP to the nearest pound (used for UPS and FedEx billed weight)
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

  // Function to calculate FM/USPS billed weight
  const calculateUSPSFirstmileBilledWeight = (actualWeight, dimWeight, isOunces) => {
    if (isOunces) {
      console.log(`FM/USPS Billed Weight (Ounces Mode): Actual Weight = ${actualWeight} oz`);
      return convertOuncesToPounds(actualWeight); // Convert ounces to pounds for display
    }
    // If pounds are selected, use the greater of actual weight or dim weight
    return Math.max(actualWeight, dimWeight);
  };

  // Function to calculate UPS and FedEx billed weight (uses greater of actual vs dim)
  const calculateUPSFedExBilledWeight = (actualWeight, dimWeight, isOunces) => {
    if (isOunces) {
      actualWeight = convertOuncesToPounds(actualWeight); // Convert ounces to pounds
      console.log(`UPS/FedEx Billed Weight (Ounces Mode): Actual Weight = ${actualWeight} lbs`);
    }
    return roundUpToNearestPound(Math.max(actualWeight, dimWeight));
  };

  // Event listener for form submission
  form.addEventListener('submit', (e) => {
    // Prevent Form Submission
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(form);
    const length = parseInputValue(formData.get('length'));
    const width = parseInputValue(formData.get('width'));
    const height = parseInputValue(formData.get('height'));
    const actualWeightInput = parseInputValue(formData.get('actual-weight'));

    // Determine whether the weight is in pounds or ounces based on the checkboxes
    const weightUnit = getWeightUnit();

    if (!weightUnit) {
      result.textContent = 'Please select either pounds or ounces for the actual weight.';
      console.log('Error: Invalid weight unit selection. Please choose pounds or ounces.');
      return;
    }

    const isPounds = weightUnit === 'lbs';
    const isOunces = weightUnit === 'oz';

    // Validation for length, width, height, and weight
    if (length === null || width === null || height === null || actualWeightInput === null) {
      result.textContent =
        'Please provide valid inputs for length, width, height, and actual weight.';
      console.log('Error: Invalid input values.');
      return;
    }

    // Validation check: length must be greater than or equal to both height and width
    if (length < width || length < height) {
      result.textContent = 'Error: Length must be greater than or equal to both height and width.';
      console.error(
        'Validation Error: Length must be greater than or equal to both height and width.'
      );
      return;
    }

    // Calculating cubic size
    const cubicSize = length * width * height;

    // Calculating dimensional weight for UPS and FedEx
    const dimWeightUPS = cubicSize / 139;
    const dimWeightFedEx = cubicSize / 139;

    // FM/USPS dimensional weight calculation
    let dimWeightUSPS = 0;
    let billedWeightUSPS;
    let billedWeightFirstmile;
    if (isPounds) {
      // Calculate dimensional weight for FM and USPS if pounds are selected
      dimWeightUSPS = cubicSize / 166;
      billedWeightUSPS = calculateUSPSFirstmileBilledWeight(
        actualWeightInput,
        dimWeightUSPS,
        isOunces
      );
      billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(
        actualWeightInput,
        dimWeightUSPS,
        isOunces
      );
    } else {
      // If ounces are selected, skip dimensional weight calculation
      billedWeightUSPS = calculateUSPSFirstmileBilledWeight(actualWeightInput, 0, isOunces);
      billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(actualWeightInput, 0, isOunces);
    }

    // UPS and FedEx billed weight calculation
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
    // Actual weight stays in pounds or ounces, but billed weight is always converted to pounds
    document.querySelector('#actual-weight-ups').textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-ups').textContent = formatActualWeight(dimWeightUPS, true);
    document.querySelector('#billed-weight-ups').textContent = formatActualWeight(
      billedWeightUPS,
      true
    );

    document.querySelector('#actual-weight-fedex').textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-fedex').textContent = formatActualWeight(
      dimWeightFedEx,
      true
    );
    document.querySelector('#billed-weight-fedex').textContent = formatActualWeight(
      billedWeightFedEx,
      true
    );

    document.querySelector('#actual-weight-firstmile').textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-firstmile').textContent = formatActualWeight(
      dimWeightUSPS,
      true
    ); // Dim weight for pounds
    document.querySelector('#billed-weight-firstmile').textContent = formatActualWeight(
      billedWeightFirstmile,
      true
    );

    document.querySelector('#actual-weight-usps').textContent = formatActualWeight(
      actualWeightInput,
      isPounds
    );
    document.querySelector('#dim-weight-usps').textContent = formatActualWeight(
      dimWeightUSPS,
      true
    ); // Dim weight for pounds
    document.querySelector('#billed-weight-usps').textContent = formatActualWeight(
      billedWeightUSPS,
      true
    );

    console.log(`Cubic Size: ${cubicSize}`);
    console.log(`Dimensional Weight (UPS): ${roundUpToNearestPound(dimWeightUPS)} lbs`);
    console.log(`Dimensional Weight (FedEx): ${roundUpToNearestPound(dimWeightFedEx)} lbs`);
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
      const formattedActualWeight = formatActualWeight(actualWeight, isPounds);
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
          const dimWeightUSPS = cubicSize / 166;

          const billedWeightUSPS = calculateUSPSFirstmileBilledWeight(
            actualWeight,
            dimWeightUSPS,
            isOunces
          );
          const billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(
            actualWeight,
            dimWeightUSPS,
            isOunces
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

  document.querySelector('input[name="length"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="width"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="height"]').addEventListener('input', updateDisplay);
  document.querySelector('input[name="actual-weight"]').addEventListener('input', updateDisplay);
});
