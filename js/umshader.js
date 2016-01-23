/*jslint devel:true nomen:true */
(function () {
	"use strict";
	var UMShader;

	UMShader = function (gl) {
		this.gl = gl;
		this.vertex_shader_ = null;
		this.fragment_shader_ = null;
		this.program_object_ = null;
	};

	UMShader.prototype.create_shader_from_id = function (vertex_shader_id, fragment_shader_id) {
		var velem = document.getElementById(vertex_shader_id),
			felem = document.getElementById(fragment_shader_id),
			gl = this.gl;

		this.id_ = vertex_shader_id + "/" + fragment_shader_id;

		this.vertex_shader_ = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(this.vertex_shader_, velem.text);
		gl.compileShader(this.vertex_shader_);

		this.fragment_shader_ = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(this.fragment_shader_, felem.text);
		gl.compileShader(this.fragment_shader_);

		if (!gl.getShaderParameter(this.vertex_shader_, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(this.vertex_shader_));
		}
		if (!gl.getShaderParameter(this.fragment_shader_, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(this.fragment_shader_));
		}

		this.program_object_ = gl.createProgram();
		gl.attachShader(this.program_object_, this.vertex_shader_);
		gl.attachShader(this.program_object_, this.fragment_shader_);
		gl.linkProgram(this.program_object_);
		if (!gl.getProgramParameter(this.program_object_, gl.LINK_STATUS)) {
			alert(gl.getShaderInfoLog(this.program_object_));
		}
	};

	UMShader.prototype.id = function () {
		return this.id_;
	};

	UMShader.prototype.program_object = function () {
		return this.program_object_;
	};

	UMShader.prototype.vertex_shader = function () {
		return this.vertex_shader_;
	};

	UMShader.prototype.fragment_shader = function () {
		return this.fragment_shader_;
	};

	UMShader.prototype.dispose = function () {
		var gl = this.gl;
		gl.DetachShader(this.program_object_, this.vertex_shader_);
		gl.DetachShader(this.program_object_, this.fragment_shader_);
		gl.DeleteShader(this.vertex_shader_);
		gl.DeleteShader(this.fragment_shader_);
		gl.DeleteProgram(this.program_object_);
	};

	window.umshader = {};
	window.umshader.UMShader = UMShader;
}());
