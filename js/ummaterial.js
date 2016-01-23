/*jslint devel:true nomen:true */
(function (ummath) {
	"use strict";
	var UMMaterial;

	UMMaterial = function (gl) {
		this.gl = gl;
		this.diffuse_ = new ummath.UMVec4d(1.0, 0.7, 0.7, 1.0);
		this.constant_color_ = new ummath.UMVec4d(1.0, 0.7, 0.7, 1.0);
		this.specular_ = new ummath.UMVec4d(0.9, 0.9, 0.9, 1.0);
		this.ambient_ = new ummath.UMVec4d(0.3, 0.3, 0.3, 1.0);
		this.flag_ = new ummath.UMVec4d(0, 0, 0, 0);
		this.constant_color_location_ = null;
		this.diffuse_location_ = null;
		this.flag_location_ = null;
		this.sampler_location_ = null;
		this.polygon_count_ = 0;
		this.diffuse_texture_ = null;
		this.diffuse_texture_image_ = null;
		this.video_ = null;
	};

	UMMaterial.prototype.draw = function (shader) {
		var gl = this.gl;
		if (!this.constant_color_location_) {
			this.constant_color_location_ = gl.getUniformLocation(shader.program_object(), "constant_color");
		}
		if (!this.diffuse_location_) {
			this.diffuse_location_ = gl.getUniformLocation(shader.program_object(), "mat_diffuse");
		}
		if (!this.flag_location_) {
			this.flag_location_ = gl.getUniformLocation(shader.program_object(), "mat_flags");
		}
		if (this.diffuse_texture_) {
			if (!this.sampler_location_) {
				this.sampler_location_ = gl.getUniformLocation(shader.program_object(), "s_texture");
			}
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.diffuse_texture_);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.diffuse_texture_image_);
			gl.uniform1i(this.sampler_location_, 0);
		}
		if (this.video_) {
			if (!this.sampler_location_) {
				this.sampler_location_ = gl.getUniformLocation(shader.program_object(), "s_texture");
			}
			gl.activeTexture(gl.TEXTURE0);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video_);
			gl.uniform1i(this.sampler_location_, 0);
		}
		if (this.flag_.xyzw[1] > 0.5) {
			gl.uniform4f(this.constant_color_location_,
				this.constant_color_.xyzw[0],
				this.constant_color_.xyzw[1],
				this.constant_color_.xyzw[2],
				this.constant_color_.xyzw[3]);
		} else {
			gl.uniform4f(this.diffuse_location_,
				this.diffuse_.xyzw[0],
				this.diffuse_.xyzw[1],
				this.diffuse_.xyzw[2],
				this.diffuse_.xyzw[3]);
		}

		gl.uniform4f(this.flag_location_,
			this.flag_.x(),
			this.flag_.y(),
			this.flag_.z(),
			this.flag_.w());

		//gl.bindTexture(gl.TEXTURE_2D, null);
	};

	UMMaterial.prototype.polygon_count = function () {
		return this.polygon_count_;
	};

	UMMaterial.prototype.set_polygon_count = function (c) {
		this.polygon_count_ = c;
	};

	UMMaterial.prototype.set_diffuse = function (diffuse) {
		this.diffuse_ = diffuse;
	};

	UMMaterial.prototype.set_constant_color = function (color) {
		this.constant_color_ = color;
		this.flag_.xyzw[1] = 1.0;
	};

	UMMaterial.prototype.set_texture = function (texture, diffuse_texture_image) {
		this.diffuse_texture_ = texture;
		this.diffuse_texture_image_ = diffuse_texture_image;
		this.flag_.xyzw[0] = 1.0;
	};

	UMMaterial.prototype.set_video_texture = function (texture, video) {
		this.diffuse_texture_ = texture;
		this.video_ = video;
		this.flag_.xyzw[0] = 1.0;
	};

	UMMaterial.prototype.reset_shader_location = function () {
		this.constant_color_location_ = null;
		this.diffuse_location_ = null;
		this.flag_location_ = null;
		this.sampler_location_ = null;
	};

	window.ummaterial = {};
	window.ummaterial.UMMaterial = UMMaterial;

}(window.ummath));
