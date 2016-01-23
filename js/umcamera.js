/*jslint devel:true nomen:true */
(function (ummath) {
	"use strict";
	var UMCamera;

	UMCamera = function (gl, w, h) {
		this.gl = gl;
		this.view_matrix_ = new ummath.UMMat44d();
		this.projection_matrix_ = new ummath.UMMat44d();
		this.view_projection_matrix_ = new ummath.UMMat44d();
		this.aspect = parseFloat(w) / parseFloat(h);
		this.fov_y = 45.0;
		this.near = 0.1;
		this.far = 1000.0;
		this.position = new ummath.UMVec3d(0, 15, 50);
		this.target = new ummath.UMVec3d(0, 15, 0);
		this.up = new ummath.UMVec3d(0, 1, 0);
		this.rotation = new ummath.UMVec3d(0, 0, 0);
		this.view_projection_location_ = {};

		ummath.um_matrix_look_at_rh(this.view_matrix_, this.position, this.target, this.up);
		ummath.um_matrix_perspective_fov_rh(this.projection_matrix_, ummath.um_to_radian(this.fov_y), this.aspect, this.near, this.far);
	};

	UMCamera.prototype.update = function () {
		this.view_projection_matrix_ = this.view_matrix_.multiply(this.projection_matrix_);
	};

	UMCamera.prototype.view_projection_matrix = function () {
		return this.view_projection_matrix_;
	};

	UMCamera.prototype.projection_matrix = function () {
		return this.projection_matrix_;
	};

	UMCamera.prototype.view_matrix = function () {
		return this.view_matrix_;
	};

	UMCamera.prototype.rotate = function (mx, my) {
		var cx,
			radius,
			rot;

		this.rotation.xyz[1] += ummath.um_to_radian(mx);
		this.rotation.xyz[0] += ummath.um_to_radian(my);

		cx = Math.cos(this.rotation.xyz[0]);
		if (cx > -ummath.EPSILON &&  cx < ummath.EPSILON) {
			this.rotation.xyz[0] -= ummath.um_sign(this.rotation.xyz[0]) * 0.01;
		}

		radius = (this.target.sub(this.position)).length();
		rot = ummath.um_euler_to_matrix_xyz(this.rotation);
		if (cx < 0.0) {
			this.up = new ummath.UMVec3d(0.0, -1.0, 0.0);
		} else {
			this.up = new ummath.UMVec3d(0.0, 1.0, 0.0);
		}
		this.position = rot.multiply(new ummath.UMVec3d(0.0, 0.0, radius)).add(this.target);
		ummath.um_matrix_look_at_rh(this.view_matrix_, this.position, this.target, this.up);
	};

	UMCamera.prototype.dolly = function (mx, my) {
		var dolly_value,
			radius,
			rot,
			cx;

		dolly_value = -my * 0.2;
		radius = (this.target.sub(this.position)).length() + dolly_value;
		if (radius < 1) { return; }

		rot = ummath.um_euler_to_matrix_xyz(this.rotation);
		cx = Math.cos(this.rotation.xyz[0]);
		if (cx < 0) {
			this.up = new ummath.UMVec3d(0.0, -1.0, 0.0);
		} else {
			this.up = new ummath.UMVec3d(0.0, 1.0, 0.0);
		}
		this.position = rot.multiply(new ummath.UMVec3d(0.0, 0.0, radius)).add(this.target);
		ummath.um_matrix_look_at_rh(this.view_matrix_, this.position, this.target, this.up);
	};

	UMCamera.prototype.pan = function (mx, my) {
		var pan_value,
			rot,
			mhorizon,
			mvertical;

		pan_value = 0.2;

		rot = ummath.um_euler_to_matrix_xyz(this.rotation);
		mhorizon = rot.multiply(new ummath.UMVec3d(-mx * pan_value, 0.0, 0.0));
		mvertical = rot.multiply(new ummath.UMVec3d(0.0, my * pan_value, 0.0));
		this.position = this.position.add(mvertical).add(mhorizon);
		this.target = this.target.add(mvertical).add(mhorizon);
		ummath.um_matrix_look_at_rh(this.view_matrix_, this.position, this.target, this.up);
	};

	UMCamera.prototype.draw = function (shader) {
		var gl = this.gl;

		if (!this.view_projection_location_.hasOwnProperty(shader.id())) {
			this.view_projection_location_[shader.id()] = gl.getUniformLocation(shader.program_object(), "view_projection_matrix");
		}

		gl.uniformMatrix4fv(this.view_projection_location_[shader.id()], false, this.view_projection_matrix_.value());
	};

	UMCamera.prototype.reset_shader_location = function () {
		this.view_projection_location_ = {};
	};

	UMCamera.prototype.resize = function (w, h) {
		this.aspect = parseFloat(w) / parseFloat(h);
		ummath.um_matrix_perspective_fov_rh(this.projection_matrix_, ummath.um_to_radian(this.fov_y), this.aspect, this.near, this.far);
	};

	window.umcamera = {};
	window.umcamera.UMCamera = UMCamera;

}(window.ummath));
