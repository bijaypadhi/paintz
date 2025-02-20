'use strict';

/**
 * @class
 * Create a new SaveDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SaveDialog(trigger) {
	Dialog.call(this, 'save', trigger);
	this._element.id = 'saveDialog';
	this._progressSpinner;
	this._saveButton;
	this._blob;
	this._userId = this._extractUserIdFromURL();
}
// Extend Dialog.
SaveDialog.prototype = Object.create(Dialog.prototype);
SaveDialog.prototype.constructor = SaveDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SaveDialog.prototype.WIDTH = '384px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
SaveDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);

	// Simplified UI: A message, progress spinner, and a Save button.
	this._element.innerHTML = `
		<div class="dialog-content">
			<p>Click "Save" to save your work.</p>
			<progress style="display: none;"></progress>
			<button id="saveButton">Save</button>
		</div>
	`;

	this._progressSpinner = this._element.querySelector('progress');
	this._saveButton = this._element.querySelector('#saveButton');

	// Bind the Save button click event to the save handler.
	this._saveButton.onclick = this._handleSave.bind(this);
};

SaveDialog.prototype._extractUserIdFromURL = function () {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('userId');
};

/**
 * @override
 * Open the dialog.
 */
SaveDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
};

/**
 * @private
 * Create a new blob URL for the image.
 * @returns {Promise} Resolves when the blob is created
 */
SaveDialog.prototype._createDownloadURL = function () {
	var that = this;
	return new Promise(function (resolve, reject) {
		that._element.classList.add('loading');
		that._progressSpinner.style.display = 'inline-block'; // Show progress spinner.
		canvas.toBlob(function (blob) {
			if (!blob) {
				reject(new Error("Failed to create blob from canvas."));
				return;
			}
			that._blob = blob;
			that._element.classList.remove('loading');
			that._progressSpinner.style.display = 'none'; // Hide progress spinner.
			resolve();
		}, 'image/jpeg', 0.92); // 0.92 is the JPEG quality
	});
};

/**
 * @private
 * Handle the save process.
 */
SaveDialog.prototype._handleSave = async function () {
	try {
		
		  alert("sdfsfs");
		// Disable the Save button to prevent multiple clicks.
		this._saveButton.disabled = true;

		// Step 1: Create the blob from the canvas.
		await this._createDownloadURL();

		// Step 2: Generate the filename based on the save count.
		var saveCount = settings.get('saveCount');
		var newFileName = (saveCount + 1) + '.webp';

		// Step 3: Update document title (optional).
		document.title = newFileName + PAGE_TITLE_SUFFIX;

		// Step 4: Mark the canvas as saved.
		undoStack.changedSinceSave = false;

		// Step 5: Increment save count.
		settings.set('saveCount', Math.min(saveCount + 1, settings.MAX_SAVE_COUNT));
		checkSaveCountMilestone();

		// Step 6: Save the blob to GCP bucket.
		await this._saveToGCPBucket(newFileName);
		console.log("File saved successfully via REST API.");

		// Step 7: Close the dialog after successful save.
		this.close();
	} catch (error) {
		console.error("Error during save process:", error);
		alert("Failed to save. Please try again.");
	} finally {
		// Re-enable the Save button.
		this._saveButton.disabled = false;
	}
};

/**
 * @private
 * Save the blob to GCP bucket via Spring REST API.
 * @param {String} fileName - The filename to use for the blob
 */
SaveDialog.prototype._saveToGCPBucket = async function (fileName) {
    if (!this._userId) {
         this._userId="5ccl8yOZicftkSQyzrHhtL0HhFD3";
    }
    alert(this._blob);
	alert(fileName);
    const endpoint = "http://localhost:8080/api/gcp/save-canvas";
    const formData = new FormData();
    formData.append('userId', this._userId);
    formData.append('file', this._blob, fileName);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("File uploaded successfully:", result);
        return result;
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
};