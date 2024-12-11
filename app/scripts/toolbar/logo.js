'use strict';

/**
 * @class
 * Create a new LogoToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function LogoToolbox(parentToolbar) {
	Toolbox.call(this, 'logo', parentToolbar);
}
// Extend Toolbox.
LogoToolbox.prototype = Object.create(Toolbox.prototype);
LogoToolbox.prototype.constructor = LogoToolbox;
