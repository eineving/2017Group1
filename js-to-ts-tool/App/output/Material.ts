export class Material  {
constructor(name, ambientColor, diffuseColor, transparency, simulateSpecular) {
	this.name = name || '';
	this.diffuseColor = diffuseColor || 0x7f7f7f;
	// default ambient color will be of 1/8 the intensity of the diffuse color
	this.ambientColor = (typeof ambientColor) == 'number' ? ambientColor : (((this.diffuseColor & 0xff0000) >> 3) & 0xff0000 | ((this.diffuseColor & 0xff00) >> 3) & 0xff00 | ((this.diffuseColor & 0xff) >> 3));
	this.transparency = transparency || 0;
	this.simulateSpecular = simulateSpecular || false;
	this.palette = null;
};

/**
	Get the palette of the material used for shadings.
	@return {Array} palette of the material as an array.
 */
getPalette() {
	if(!this.palette) {
		this.palette = new Array(256);
		this.generatePalette();
	}

	return this.palette;
};

/**
	@private
 */
generatePalette() {
	var ambientR = (this.ambientColor & 0xff0000) >> 16;
	var ambientG = (this.ambientColor & 0xff00) >> 8;
	var ambientB = this.ambientColor & 0xff;
	var diffuseR = (this.diffuseColor & 0xff0000) >> 16;
	var diffuseG = (this.diffuseColor & 0xff00) >> 8;
	var diffuseB = this.diffuseColor & 0xff;

	if(this.simulateSpecular) {
		var i = 0;
		while(i < 204) {
			var r = Math.max(ambientR, i * diffuseR / 204);
			var g = Math.max(ambientG, i * diffuseG / 204);
			var b = Math.max(ambientB, i * diffuseB / 204);
			if(r > 255)
				r = 255;
			if(g > 255)
				g = 255;
			if(b > 255)
				b = 255;

			this.palette[i++] = r << 16 | g << 8 | b;
		}

		// simulate specular high light
		while(i < 256) {
			var r = Math.max(ambientR, diffuseR + (i - 204) * (255 - diffuseR) / 82);
			var g = Math.max(ambientG, diffuseG + (i - 204) * (255 - diffuseG) / 82);
			var b = Math.max(ambientB, diffuseB + (i - 204) * (255 - diffuseB) / 82);
			if(r > 255)
				r = 255;
			if(g > 255)
				g = 255;
			if(b > 255)
				b = 255;

			this.palette[i++] = r << 16 | g << 8 | b;
		}
	}
	else {
		var i = 0;
		while(i < 256) {
			var r = Math.max(ambientR, i * diffuseR / 256);
			var g = Math.max(ambientG, i * diffuseG / 256);
			var b = Math.max(ambientB, i * diffuseB / 256);
			if(r > 255)
				r = 255;
			if(g > 255)
				g = 255;
			if(b > 255)
				b = 255;

			this.palette[i++] = r << 16 | g << 8 | b;
		}
	}
};

/**
 * {String} Name of the material.
 */
name = '';
ambientColor = 0;
diffuseColor = 0x7f7f7f;
transparency = 0;
simulateSpecular = false;
palette = null;


/**
	@class Texture

	This class implements texture which describes the surface details for a mesh.
 */
}
