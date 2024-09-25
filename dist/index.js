window.Webflow || (window.Webflow = []);
window.Webflow.push(function () {
    console.log('Dimensional Weight Calculator initialized');
    var form = document.querySelector('[fs-element="form"]');
    var result = document.querySelector('[fs-element="result"]');
    var poundsCheckbox = document.querySelector('.pounds-checkbox');
    var ouncesCheckbox = document.querySelector('.ounces-checkbox');
    if (!form || !result || !poundsCheckbox || !ouncesCheckbox)
        return;
    // Function to validate and parse input values
    var parseInputValue = function (value) {
        var parsedValue = parseFloat(value || '');
        return isNaN(parsedValue) ? null : parsedValue;
    };
    // Function to format actual weight based on the unit
    var formatActualWeight = function (weight, isPounds) {
        return isPounds ? "".concat(Math.round(weight), " lbs") : "".concat(Math.round(weight), " oz");
    };
    // Function to round to the nearest pound
    var roundToNearestPound = function (weight) { return Math.round(weight); };
    // Function to round UP to the nearest pound (used for UPS and FedEx billed weight)
    var roundUpToNearestPound = function (weight) { return Math.ceil(weight); };
    // Function to determine if pounds or ounces are selected
    var getWeightUnit = function () {
        if (poundsCheckbox.checked)
            return 'lbs';
        if (ouncesCheckbox.checked)
            return 'oz';
        return null;
    };
    // Function to calculate billed weight for USPS and FM (uses actual weight when ounces are selected)
    var calculateUSPSFirstmileBilledWeight = function (actualWeight, isOunces) {
        if (isOunces) {
            console.log("FM/USPS Billed Weight (Ounces Mode): Actual Weight = ".concat(actualWeight, " oz"));
            return actualWeight; // Use actual weight when ounces are selected for USPS and Firstmile
        }
        return actualWeight; // Default behavior if not ounces (use actual weight in this case)
    };
    // Function to calculate UPS and FedEx billed weight (uses greater of actual vs dim)
    var calculateUPSFedExBilledWeight = function (actualWeight, dimWeight, isOunces) {
        if (isOunces) {
            actualWeight = actualWeight / 16; // Convert ounces to pounds
            console.log("UPS/FedEx Billed Weight (Ounces Mode): Actual Weight = ".concat(actualWeight, " lbs"));
        }
        return roundUpToNearestPound(Math.max(actualWeight, dimWeight));
    };
    // Event listener for form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var formData = new FormData(form);
        var length = parseInputValue(formData.get('length'));
        var width = parseInputValue(formData.get('width'));
        var height = parseInputValue(formData.get('height'));
        var actualWeightInput = parseInputValue(formData.get('actual-weight'));
        var weightUnit = getWeightUnit();
        if (!weightUnit) {
            result.textContent = 'Please select either pounds or ounces for the actual weight.';
            console.log('Error: Invalid weight unit selection. Please choose pounds or ounces.');
            return;
        }
        var isPounds = weightUnit === 'lbs';
        var isOunces = weightUnit === 'oz';
        if (length === null || width === null || height === null || actualWeightInput === null) {
            result.textContent =
                'Please provide valid inputs for length, width, height, and actual weight.';
            console.log('Error: Invalid input values.');
            return;
        }
        if (length < width || length < height) {
            result.textContent = 'Error: Length must be greater than or equal to both height and width.';
            console.error('Validation Error: Length must be greater than or equal to both height and width.');
            return;
        }
        var cubicSize = length * width * height;
        var dimWeightUPS = cubicSize / 139;
        var dimWeightFedEx = cubicSize / 139;
        var billedWeightUSPS = calculateUSPSFirstmileBilledWeight(actualWeightInput, isOunces);
        var billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(actualWeightInput, isOunces);
        var billedWeightUPS = calculateUPSFedExBilledWeight(actualWeightInput, dimWeightUPS, isOunces);
        var billedWeightFedEx = calculateUPSFedExBilledWeight(actualWeightInput, dimWeightFedEx, isOunces);
        result.textContent = 'Dimensional Weight has been calculated on the table.';
        document.querySelector('#actual-weight-ups').textContent = formatActualWeight(actualWeightInput, isPounds);
        document.querySelector('#dim-weight-ups').textContent =
            "".concat(roundToNearestPound(dimWeightUPS), " lbs");
        document.querySelector('#billed-weight-ups').textContent = formatActualWeight(billedWeightUPS, isPounds);
        document.querySelector('#actual-weight-fedex').textContent = formatActualWeight(actualWeightInput, isPounds);
        document.querySelector('#dim-weight-fedex').textContent =
            "".concat(roundToNearestPound(dimWeightFedEx), " lbs");
        document.querySelector('#billed-weight-fedex').textContent = formatActualWeight(billedWeightFedEx, isPounds);
        document.querySelector('#actual-weight-firstmile').textContent = formatActualWeight(actualWeightInput, isPounds);
        document.querySelector('#dim-weight-firstmile').textContent = 'N/A'; // FM doesn't need dim weight in ounces mode
        document.querySelector('#billed-weight-firstmile').textContent = formatActualWeight(billedWeightFirstmile, isPounds);
        document.querySelector('#actual-weight-usps').textContent = formatActualWeight(actualWeightInput, isPounds);
        document.querySelector('#dim-weight-usps').textContent = 'N/A'; // USPS doesn't need dim weight in ounces mode
        document.querySelector('#billed-weight-usps').textContent = formatActualWeight(billedWeightUSPS, isPounds);
        console.log("Cubic Size: ".concat(cubicSize));
        console.log("Dimensional Weight (UPS): ".concat(roundToNearestPound(dimWeightUPS), " lbs"));
        console.log("Dimensional Weight (FedEx): ".concat(roundToNearestPound(dimWeightFedEx), " lbs"));
        console.log("Billed Weight (USPS): ".concat(billedWeightUSPS, " oz"));
        console.log("Billed Weight (Firstmile): ".concat(billedWeightFirstmile, " oz"));
        console.log("Billed Weight (UPS): ".concat(billedWeightUPS, " lbs"));
        console.log("Billed Weight (FedEx): ".concat(billedWeightFedEx, " lbs"));
    });
    var updateDisplay = function () {
        var lengthInput = document.querySelector('input[name="length"]');
        var widthInput = document.querySelector('input[name="width"]');
        var heightInput = document.querySelector('input[name="height"]');
        var actualWeightInput = document.querySelector('input[name="actual-weight"]');
        var lengthDisplay = document.querySelector('#length-display');
        var widthDisplay = document.querySelector('#width-display');
        var heightDisplay = document.querySelector('#height-display');
        var actualWeightDisplay = document.querySelector('#actual-weight-display');
        lengthDisplay.textContent = lengthInput.value || '0';
        widthDisplay.textContent = widthInput.value || '0';
        heightDisplay.textContent = heightInput.value || '0';
        actualWeightDisplay.textContent = actualWeightInput.value || '0';
        var weightUnit = getWeightUnit();
        if (!weightUnit) {
            document.querySelector('#billed-weight-usps').textContent = 'Please select lbs or oz.';
            return;
        }
        var isPounds = weightUnit === 'lbs';
        var isOunces = weightUnit === 'oz';
        var actualWeight = parseInputValue(actualWeightInput.value);
        if (actualWeight !== null) {
            var formattedActualWeight = formatActualWeight(actualWeight, isPounds);
            document.querySelector('#actual-weight-ups').textContent = formattedActualWeight;
            document.querySelector('#actual-weight-fedex').textContent = formattedActualWeight;
            document.querySelector('#actual-weight-firstmile').textContent = formattedActualWeight;
            document.querySelector('#actual-weight-usps').textContent = formattedActualWeight;
            var length_1 = parseInputValue(lengthInput.value);
            var width = parseInputValue(widthInput.value);
            var height = parseInputValue(heightInput.value);
            if (length_1 !== null && width !== null && height !== null) {
                var cubicSize = length_1 * width * height;
                var dimWeightUPS = cubicSize / 139;
                var dimWeightFedEx = cubicSize / 139;
                var billedWeightUSPS = calculateUSPSFirstmileBilledWeight(actualWeight, isOunces);
                var billedWeightFirstmile = calculateUSPSFirstmileBilledWeight(actualWeight, isOunces);
                var billedWeightUPS = calculateUPSFedExBilledWeight(actualWeight, dimWeightUPS, isOunces);
                var billedWeightFedEx = calculateUPSFedExBilledWeight(actualWeight, dimWeightFedEx, isOunces);
                document.querySelector('#billed-weight-usps').textContent = formatActualWeight(billedWeightUSPS, isPounds);
                document.querySelector('#billed-weight-firstmile').textContent = formatActualWeight(billedWeightFirstmile, isPounds);
                document.querySelector('#billed-weight-ups').textContent = formatActualWeight(billedWeightUPS, isPounds);
                document.querySelector('#billed-weight-fedex').textContent = formatActualWeight(billedWeightFedEx, isPounds);
            }
        }
        else {
            document.querySelector('#actual-weight-ups').textContent = '0';
            document.querySelector('#actual-weight-fedex').textContent = '0';
            document.querySelector('#actual-weight-firstmile').textContent = '0';
            document.querySelector('#actual-weight-usps').textContent = '0';
            document.querySelector('#billed-weight-usps').textContent = '0';
            document.querySelector('#billed-weight-firstmile').textContent = '0';
            document.querySelector('#billed-weight-ups').textContent = '0';
            document.querySelector('#billed-weight-fedex').textContent = '0';
            console.log('Error: Invalid actual weight input.');
        }
    };
    document.querySelector('input[name="length"]').addEventListener('input', updateDisplay);
    document.querySelector('input[name="width"]').addEventListener('input', updateDisplay);
    document.querySelector('input[name="height"]').addEventListener('input', updateDisplay);
    document.querySelector('input[name="actual-weight"]').addEventListener('input', updateDisplay);
});
